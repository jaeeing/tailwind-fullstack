import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();
app.get("/api/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
export default app;
