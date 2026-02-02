const fs = require('fs');
const files = {
  '.gitignore': 'node_modules\ndist\n.env\n*.db',
  'vercel.json': JSON.stringify({
    version: 2,
    rewrites: [{ source: '/api/(.*)', destination: '/api/server.ts' }, { source: '/(.*)', destination: '/' }]
  }, null, 2),
  'prisma/schema.prisma': 'datasource db { provider="sqlite"\nurl="file:./dev.db" }\ngenerator client { provider="prisma-client-js" }\nmodel User { id Int @id @default(autoincrement())\nname String\nemail String @unique }',
  'api/server.ts': 'import express from "express";\nimport { PrismaClient } from "@prisma/client";\nconst app = express();\nconst prisma = new PrismaClient();\napp.get("/api/users", async (req, res) => {\n  const users = await prisma.user.findMany();\n  res.json(users);\n});\nexport default app;',
  'src/App.tsx': 'import React from "react";\nexport default function App() { return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="p-10 bg-white rounded-2xl shadow-xl"><h1 className="text-4xl font-extrabold text-indigo-600 mb-4">Tailwind Fullstack</h1><p className="text-gray-600">IT 마이스터의 현대적 개발 연구소입니다.</p></div></div>; }'
};

Object.entries(files).forEach(([path, content]) => {
  const dir = path.split('/').slice(0, -1).join('/');
  if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path, content);
  console.log('✅ 생성 완료:', path);
});

