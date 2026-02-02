import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../dev.db");
const dbUrl = `file:${dbPath}`;

console.log("🔍 DB 경로:", dbPath);
console.log("🔍 DB URL:", dbUrl);
console.log("🔍 파일 존재 여부:", existsSync(dbPath));

const app = express();

// LibSQL 클라이언트 생성
const libsql = createClient({
  url: dbUrl
});

// 어댑터 생성
const adapter = new PrismaLibSql({ 
  url: dbUrl 
});

// PrismaClient 생성
const prisma = new PrismaClient({ adapter });

// JSON 파싱 미들웨어
app.use(express.json());

// CORS 설정 (프론트엔드 연동을 위해)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==================== CRUD API ====================

// 📖 READ - 모든 사용자 조회
app.get("/api/users", async (req, res) => {
  try {
    console.log("📖 [GET] 사용자 목록 조회");
    const users = await prisma.user.findMany({
      orderBy: { id: 'desc' } // 최신순 정렬
    });
    console.log(`✅ ${users.length}명 조회 성공`);
    res.json(users);
  } catch (error) {
    console.error("❌ 조회 에러:", error);
    res.status(500).json({ 
      error: "사용자 조회에 실패했습니다.",
      message: error.message 
    });
  }
});

// 📖 READ - 특정 사용자 조회
app.get("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`📖 [GET] 사용자 조회 (ID: ${id})`);
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: "사용자를 찾을 수 없습니다." 
      });
    }
    
    console.log(`✅ 사용자 조회 성공:`, user);
    res.json(user);
  } catch (error) {
    console.error("❌ 조회 에러:", error);
    res.status(500).json({ 
      error: "사용자 조회에 실패했습니다.",
      message: error.message 
    });
  }
});

// ✏️ CREATE - 새 사용자 추가
app.post("/api/users", async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log(`✏️ [POST] 사용자 생성:`, { email, name });
    
    // 유효성 검사
    if (!email) {
      return res.status(400).json({ 
        error: "이메일은 필수입니다." 
      });
    }
    
    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      return res.status(409).json({ 
        error: "이미 존재하는 이메일입니다." 
      });
    }
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null
      }
    });
    
    console.log(`✅ 사용자 생성 성공:`, user);
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ 생성 에러:", error);
    res.status(500).json({ 
      error: "사용자 생성에 실패했습니다.",
      message: error.message 
    });
  }
});

// 🔄 UPDATE - 사용자 정보 수정
app.put("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { email, name } = req.body;
    console.log(`🔄 [PUT] 사용자 수정 (ID: ${id}):`, { email, name });
    
    // 사용자 존재 확인
    const existing = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ 
        error: "사용자를 찾을 수 없습니다." 
      });
    }
    
    // 이메일 중복 확인 (다른 사용자가 사용 중인지)
    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return res.status(409).json({ 
          error: "이미 존재하는 이메일입니다." 
        });
      }
    }
    
    // 사용자 정보 수정
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name !== undefined && { name: name || null })
      }
    });
    
    console.log(`✅ 사용자 수정 성공:`, user);
    res.json(user);
  } catch (error) {
    console.error("❌ 수정 에러:", error);
    res.status(500).json({ 
      error: "사용자 수정에 실패했습니다.",
      message: error.message 
    });
  }
});

// 🗑️ DELETE - 사용자 삭제
app.delete("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`🗑️ [DELETE] 사용자 삭제 (ID: ${id})`);
    
    // 사용자 존재 확인
    const existing = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ 
        error: "사용자를 찾을 수 없습니다." 
      });
    }
    
    // 사용자 삭제
    await prisma.user.delete({
      where: { id }
    });
    
    console.log(`✅ 사용자 삭제 성공 (ID: ${id})`);
    res.json({ 
      message: "사용자가 삭제되었습니다.",
      id 
    });
  } catch (error) {
    console.error("❌ 삭제 에러:", error);
    res.status(500).json({ 
      error: "사용자 삭제에 실패했습니다.",
      message: error.message 
    });
  }
});

// ==================== 기타 API ====================

// 홈 페이지
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>User API</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #2563eb; }
          .endpoint {
            background: #f8fafc;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #2563eb;
          }
          .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
            font-size: 12px;
          }
          .get { background: #10b981; color: white; }
          .post { background: #3b82f6; color: white; }
          .put { background: #f59e0b; color: white; }
          .delete { background: #ef4444; color: white; }
          code {
            background: #1e293b;
            color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 User CRUD API</h1>
          <p>사용 가능한 API 엔드포인트:</p>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <code>/api/users</code>
            <p>모든 사용자 조회</p>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <code>/api/users/:id</code>
            <p>특정 사용자 조회</p>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>
            <code>/api/users</code>
            <p>새 사용자 생성</p>
            <code>{ "email": "user@example.com", "name": "홍길동" }</code>
          </div>
          
          <div class="endpoint">
            <span class="method put">PUT</span>
            <code>/api/users/:id</code>
            <p>사용자 정보 수정</p>
            <code>{ "email": "new@example.com", "name": "김철수" }</code>
          </div>
          
          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <code>/api/users/:id</code>
            <p>사용자 삭제</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log("=========================================");
  console.log(`✅ 서버 가동 성공! (Port: ${PORT})`);
  console.log(`🏠 홈: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/users`);
  console.log("=========================================");
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️ 서버 종료 중...');
  await prisma.$disconnect();
  process.exit(0);
});

