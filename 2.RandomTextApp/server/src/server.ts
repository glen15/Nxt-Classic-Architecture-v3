import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createDB, DB } from "./db";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// ─── DB ─────────────────────────────────────────────────────────

let db: DB;

// DB 연결 상태 체크 미들웨어
const checkDB = (req: Request, res: Response, next: NextFunction) => {
  if (!db?.isConnected()) {
    return res.status(503).json({
      error: "데이터베이스 연결 실패",
      message:
        "현재 데이터베이스 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.",
    });
  }
  next();
};

// ─── Validation Helpers ─────────────────────────────────────────

export const validateText = (text: unknown): string | null => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return "텍스트는 필수입니다";
  }
  if (text.length > 500) {
    return "텍스트는 500자 이하여야 합니다";
  }
  return null;
};

export const validateUsername = (username: unknown): string | null => {
  if (!username || typeof username !== "string" || !username.trim()) {
    return "사용자 이름은 필수입니다";
  }
  if (username.length > 100) {
    return "사용자 이름은 100자 이하여야 합니다";
  }
  return null;
};

// ─── Routes ─────────────────────────────────────────────────────

// 기본 경로 - 서버 상태 확인
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "서버 실행 중..",
    dbType: process.env.DB_TYPE || "sqlite",
    dbConnected: db?.isConnected() ?? false,
  });
});

// 랜덤 텍스트 조회
app.get("/api/text", checkDB, async (req: Request, res: Response) => {
  try {
    const row = await db.getRandomText();
    if (!row) {
      return res.status(404).json({ message: "저장된 텍스트가 없습니다" });
    }
    res.json({ text: `${row.text} by ${row.username}` });
  } catch (error) {
    console.error("데이터 조회 중 오류:", error);
    res.status(500).json({ error: "데이터 조회 실패" });
  }
});

// 전체 텍스트 목록 조회
app.get("/api/texts", checkDB, async (req: Request, res: Response) => {
  try {
    const rows = await db.getAllTexts();
    res.json({ texts: rows });
  } catch (error) {
    console.error("목록 조회 중 오류:", error);
    res.status(500).json({ error: "목록 조회 실패" });
  }
});

// 새로운 텍스트 저장
app.post("/api/text", checkDB, async (req: Request, res: Response) => {
  try {
    const { text, username } = req.body;

    const textError = validateText(text);
    if (textError) return res.status(400).json({ error: textError });

    const usernameError = validateUsername(username);
    if (usernameError) return res.status(400).json({ error: usernameError });

    await db.insertText(`${text} ...아마도...`, username);
    res.status(201).json({ message: "텍스트가 성공적으로 저장되었습니다" });
  } catch (error) {
    console.error("데이터 저장 중 오류:", error);
    res.status(500).json({ error: "데이터 저장 실패" });
  }
});

// 텍스트 삭제
app.delete("/api/text/:id", checkDB, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "유효하지 않은 ID입니다" });
    }

    const deleted = await db.deleteText(id);
    if (!deleted) {
      return res.status(404).json({ error: "해당 텍스트를 찾을 수 없습니다" });
    }

    res.json({ message: "텍스트가 성공적으로 삭제되었습니다" });
  } catch (error) {
    console.error("데이터 삭제 중 오류:", error);
    res.status(500).json({ error: "데이터 삭제 실패" });
  }
});

// ─── Error Handler ──────────────────────────────────────────────

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("예상치 못한 에러:", err);
  res.status(500).json({ error: "서버에서 오류가 발생했습니다" });
});

// ─── Start ──────────────────────────────────────────────────────

const start = async () => {
  db = await createDB();

  app.listen(port, () => {
    console.log(`서버가 ${port}번 포트에서 실행 중입니다`);
  });
};

start().catch((error) => {
  console.error("서버 시작 실패:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("처리되지 않은 에러:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("처리되지 않은 Promise 거부:", error);
  process.exit(1);
});

export { app };
