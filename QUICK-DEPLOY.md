# ⚡ 빠른 배포 체크리스트

## 🎯 목표
**10분 안에 실제 작동하는 웹사이트 배포하기!**

---

## ✅ 사전 준비 (5분)

### 1. README 파일 추가
```bash
cp README.md ./README.md
```

### 2. API URL 환경변수로 변경
**`src/App.tsx` 3번째 줄 수정:**

```typescript
// Before
const API_URL = 'http://localhost:3000/api/users'

// After
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/users'
```

### 3. .gitignore 업데이트
```bash
cat >> .gitignore << 'EOF'
src/App.tsx.backup
src/App-Enhanced.tsx
src/App-DarkMode.tsx
EOF
```

### 4. 커밋 & 푸시
```bash
git add .
git commit -m "docs: Add README and prepare for deployment"
git push origin main
```

---

## 🚀 백엔드 배포 - Render (2분)

### 단계별 체크리스트

#### 1. Render 가입
- [ ] https://render.com 접속
- [ ] "Get Started for Free" 클릭
- [ ] GitHub로 로그인

#### 2. Web Service 생성
- [ ] "New +" → "Web Service" 클릭
- [ ] GitHub 저장소 연결
- [ ] `jaeeing/tailwind-fullstack` 선택

#### 3. 설정 입력
```
Name: tailwind-fullstack-api
Branch: main
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npm run dev:backend
```

#### 4. 환경 변수
- [ ] `NODE_VERSION` = `20`
- [ ] `DATABASE_URL` = `file:./dev.db`

#### 5. 디스크 추가
- [ ] Name: `data`
- [ ] Mount Path: `/opt/render/project/src`
- [ ] Size: `1 GB`

#### 6. 배포
- [ ] "Create Web Service" 클릭
- [ ] 3-5분 대기
- [ ] ✅ URL 복사 (예: `https://xxx.onrender.com`)

---

## 🎨 프론트엔드 배포 - Vercel (2분)

### 단계별 체크리스트

#### 1. Vercel 가입
- [ ] https://vercel.com 접속
- [ ] "Sign Up" 클릭
- [ ] GitHub로 로그인

#### 2. 프로젝트 Import
- [ ] "Add New..." → "Project"
- [ ] `jaeeing/tailwind-fullstack` 선택
- [ ] "Import" 클릭

#### 3. 설정 확인
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

#### 4. 환경 변수 (중요!)
- [ ] Name: `VITE_API_URL`
- [ ] Value: `https://your-backend.onrender.com/api/users`
- [ ] ⚠️ Render URL로 교체!

#### 5. 배포
- [ ] "Deploy" 클릭
- [ ] 1-2분 대기
- [ ] ✅ URL 확인 (예: `https://xxx.vercel.app`)

---

## 🧪 테스트 (1분)

### 백엔드 테스트
```bash
# 브라우저나 curl로 확인
https://your-backend.onrender.com/api/users

# 결과: []
```

### 프론트엔드 테스트
```
https://your-frontend.vercel.app
```

- [ ] 페이지 로드 확인
- [ ] 다크모드 토글
- [ ] 사용자 추가 테스트
- [ ] 검색/정렬 테스트

---

## 🎉 완료!

### 결과 URL
```
프론트엔드: https://tailwind-fullstack.vercel.app
백엔드 API: https://tailwind-fullstack-api.onrender.com
```

### 공유하기
이제 이 URL을 누구에게나 공유할 수 있습니다! 🚀

---

## 🐛 문제 발생 시

### API 연결 안 됨
1. Vercel Environment Variables 확인
2. `VITE_API_URL`이 정확한지 확인
3. Redeploy 클릭

### Render 배포 실패
1. Render Logs 탭 확인
2. Build Command 확인
3. Disk 추가했는지 확인

### 데이터 저장 안 됨
1. Render Disk 설정 확인
2. Mount Path: `/opt/render/project/src`
3. 재배포 필요

---

## 📞 도움말

- Render 문서: https://render.com/docs
- Vercel 문서: https://vercel.com/docs
- 이슈: https://github.com/jaeeing/tailwind-fullstack/issues

---

**예상 소요 시간: 10분**
**비용: 100% 무료** ✨
