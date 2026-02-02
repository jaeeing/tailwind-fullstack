# 🚀 배포 가이드 - 무료로 풀스택 앱 배포하기

## 📋 목차
1. [준비 사항](#준비-사항)
2. [백엔드 배포 (Render)](#백엔드-배포-render)
3. [프론트엔드 배포 (Vercel)](#프론트엔드-배포-vercel)
4. [환경변수 설정](#환경변수-설정)
5. [테스트](#테스트)

---

## 준비 사항

### 1. 계정 생성 (무료)
- ✅ GitHub 계정 (이미 있음)
- 🆕 [Render](https://render.com) - 백엔드용
- 🆕 [Vercel](https://vercel.com) - 프론트엔드용

### 2. 코드 푸시
```bash
# README.md 추가
cp README.md ./README.md

# .gitignore 확인/추가
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.db
.DS_Store
src/App.tsx.backup
src/App-Enhanced.tsx
src/App-DarkMode.tsx
EOF

# 커밋 & 푸시
git add .
git commit -m "docs: Add README and deployment configs"
git push origin main
```

---

## 백엔드 배포 (Render)

### 1단계: Render 계정 생성 및 로그인
1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub로 로그인

### 2단계: 새 Web Service 생성
1. Dashboard → "New +" → "Web Service"
2. "Connect a repository" → GitHub 연결
3. `jaeeing/tailwind-fullstack` 선택

### 3단계: 서비스 설정
다음과 같이 입력:

```yaml
Name: tailwind-fullstack-api
Region: Singapore (or closest)
Branch: main
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npm run dev:backend
```

### 4단계: 환경 변수 추가
"Environment" 섹션에서 추가:

```
NODE_VERSION=20
DATABASE_URL=file:./dev.db
```

### 5단계: 디스크 추가 (중요!)
"Disk" 섹션에서:
- Name: `data`
- Mount Path: `/opt/render/project/src`
- Size: `1 GB`

### 6단계: 배포
1. "Create Web Service" 클릭
2. 배포 완료까지 대기 (3-5분)
3. URL 복사 (예: `https://tailwind-fullstack-api.onrender.com`)

### 7단계: API 테스트
```bash
# 브라우저에서 확인
https://your-app-name.onrender.com/api/users

# 또는 curl로 테스트
curl https://your-app-name.onrender.com/api/users
```

---

## 프론트엔드 배포 (Vercel)

### 1단계: API URL 환경변수로 변경

**`src/App.tsx` 수정:**

```typescript
// 기존 코드 (3번째 줄)
const API_URL = 'http://localhost:3000/api/users'

// 변경 후
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/users'
```

**변경사항 커밋:**
```bash
git add src/App.tsx
git commit -m "feat: Use environment variable for API URL"
git push origin main
```

### 2단계: Vercel 계정 생성 및 로그인
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. GitHub로 로그인

### 3단계: 프로젝트 Import
1. Dashboard → "Add New..." → "Project"
2. "Import Git Repository"
3. `jaeeing/tailwind-fullstack` 선택
4. "Import" 클릭

### 4단계: 프로젝트 설정

**Framework Preset:** Vite
**Root Directory:** `./` (기본값)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 5단계: 환경 변수 추가 (중요!)

"Environment Variables" 섹션에서:

```
Name: VITE_API_URL
Value: https://your-backend-url.onrender.com/api/users
```

⚠️ **주의:** `your-backend-url`을 실제 Render에서 받은 URL로 변경하세요!

예시:
```
VITE_API_URL=https://tailwind-fullstack-api.onrender.com/api/users
```

### 6단계: 배포
1. "Deploy" 클릭
2. 배포 완료까지 대기 (1-2분)
3. URL 확인 (예: `https://tailwind-fullstack.vercel.app`)

---

## 환경변수 설정

### 백엔드 (Render)
```
NODE_VERSION=20
DATABASE_URL=file:./dev.db
```

### 프론트엔드 (Vercel)
```
VITE_API_URL=https://your-backend-url.onrender.com/api/users
```

---

## CORS 설정 (이미 완료됨)

`api/server.ts`에 CORS 설정이 포함되어 있습니다:

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

---

## 테스트

### 1. 백엔드 API 테스트
```bash
# 사용자 목록 조회
curl https://your-backend.onrender.com/api/users

# 사용자 추가
curl -X POST https://your-backend.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. 프론트엔드 테스트
1. Vercel URL 접속 (예: `https://tailwind-fullstack.vercel.app`)
2. 다크모드 토글 확인
3. 사용자 추가/수정/삭제 테스트
4. 검색/정렬 기능 확인

---

## 🐛 문제 해결

### 문제 1: API 연결 안 됨 (CORS 에러)

**증상:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**해결:**
`api/server.ts`의 CORS 설정 확인 (이미 있어야 함)

### 문제 2: Render 배포 실패

**증상:**
```
Build failed
```

**해결:**
1. Render 대시보드 → Logs 확인
2. Build Command 확인: `npm install && npx prisma generate`
3. Start Command 확인: `npm run dev:backend`

### 문제 3: Vercel 환경변수 적용 안 됨

**해결:**
1. Vercel Dashboard → Settings → Environment Variables
2. `VITE_API_URL` 추가되었는지 확인
3. Redeploy: Deployments → ... → Redeploy

### 문제 4: Database가 비어있음

**해결:**
Render는 첫 배포 시 빈 DB를 생성합니다. 프론트엔드에서 사용자를 추가하면 자동으로 저장됩니다.

---

## 📊 배포 후 체크리스트

### 백엔드 (Render)
- [ ] 배포 완료 (녹색 체크)
- [ ] `/api/users` 접속 시 `[]` 응답
- [ ] POST 요청으로 사용자 추가 가능

### 프론트엔드 (Vercel)
- [ ] 배포 완료
- [ ] 웹사이트 로드됨
- [ ] 다크모드 작동
- [ ] 사용자 추가 작동
- [ ] 검색/정렬 작동

---

## 🎉 완료!

축하합니다! 이제 다음 URL로 접속 가능합니다:

- **프론트엔드**: `https://tailwind-fullstack.vercel.app`
- **백엔드 API**: `https://your-backend.onrender.com/api/users`

이 URL을 다른 사람들과 공유하면 누구나 사용할 수 있습니다!

---

## 💡 추가 팁

### 커스텀 도메인 추가
1. Vercel Dashboard → Settings → Domains
2. 자신의 도메인 추가 가능

### 배포 자동화
- GitHub에 push하면 자동으로 재배포됨
- `main` 브랜치에 커밋하면 Vercel이 자동 배포

### 모니터링
- Render: Logs 탭에서 서버 로그 확인
- Vercel: Analytics 탭에서 트래픽 확인

---

## 📞 도움이 필요하면

1. Render 문서: https://render.com/docs
2. Vercel 문서: https://vercel.com/docs
3. 이슈 등록: https://github.com/jaeeing/tailwind-fullstack/issues

---

Made with ❤️ by Jaeeing
