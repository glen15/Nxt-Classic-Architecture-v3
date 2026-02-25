import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const app = express();
const port = 80;

app.use(cors());
app.use(express.json());

// ─── DB Connection ───────────────────────────────────────────────

let dbConnection: mysql.Connection | null = null;

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    category VARCHAR(50) DEFAULT '',
    due_date DATE DEFAULT NULL,
    ai_suggestion TEXT DEFAULT NULL,
    ai_type ENUM('gemini') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// Gemini AI 설정
const configureGemini = () => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("Gemini API 키가 설정되지 않았습니다.");
    return null;
  }
  const genAI = new GoogleGenerativeAI(geminiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

async function connectToDatabase(): Promise<void> {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error("DB 환경변수가 설정되지 않았습니다.");
    console.error("필요한 변수: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
    console.error(".env 파일을 확인해주세요.");
    return;
  }

  try {
    dbConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    await dbConnection.execute(CREATE_TABLE_SQL);
    console.log("MySQL 연결 성공 & todos 테이블 준비 완료");
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };

    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("DB 접속 거부: 사용자명 또는 비밀번호를 확인해주세요.");
    } else if (err.code === "ECONNREFUSED") {
      console.error("DB 연결 실패: MySQL 서버가 실행 중인지 확인해주세요.");
    } else if (err.code === "ER_BAD_DB_ERROR") {
      console.error("DB 오류: 데이터베이스가 존재하지 않습니다.");
    } else {
      console.error("DB 연결 오류:", err.message);
    }

    dbConnection = null;
  }
}

function getDatabaseConfigStatus() {
  return {
    DB_HOST: process.env.DB_HOST || "(미설정)",
    DB_USER: process.env.DB_USER || "(미설정)",
    DB_PASSWORD: process.env.DB_PASSWORD || "(미설정)",
    DB_NAME: process.env.DB_NAME || "(미설정)",
  };
}

function printServerStatus(): void {
  const dbConfig = getDatabaseConfigStatus();

  console.log("\n========================================");
  console.log("  AI Todo API 서버");
  console.log("========================================");
  console.log(`  URL:      http://localhost:${port}`);
  console.log(`  DB 연결:  ${dbConnection ? "연결됨" : "연결 안됨"}`);
  console.log(`  DB HOST:  ${dbConfig.DB_HOST}`);
  console.log(`  DB USER:  ${dbConfig.DB_USER}`);
  console.log(`  DB NAME:  ${dbConfig.DB_NAME}`);
  console.log(`  Gemini:   ${geminiModel ? "설정됨" : "설정 안됨"}`);
  console.log("========================================\n");
}

// ─── Middleware ───────────────────────────────────────────────────

function checkDbConnection(_req: Request, res: Response, next: NextFunction): void {
  if (!dbConnection) {
    res.status(503).json({
      success: false,
      error: "데이터베이스에 연결되어 있지 않습니다",
    });
    return;
  }
  next();
}

function checkGeminiConfig(_req: Request, res: Response, next: NextFunction): void {
  if (!geminiModel) {
    res.status(503).json({
      success: false,
      error: "AI 서비스를 현재 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
    });
    return;
  }
  next();
}

// Gemini 초기화
const geminiModel = configureGemini();

// ─── Validation Helpers ──────────────────────────────────────────

export const validateTitle = (title: unknown): string | null => {
  if (!title || typeof title !== "string" || !title.trim()) {
    return "제목을 입력해주세요";
  }
  if (title.length > 200) {
    return "제목은 200자 이하여야 합니다";
  }
  return null;
};

export const validatePriority = (priority: unknown): string | null => {
  if (priority === undefined) return null;
  const valid = ["low", "medium", "high"];
  if (typeof priority !== "string" || !valid.includes(priority)) {
    return "우선순위는 low, medium, high 중 하나여야 합니다";
  }
  return null;
};

export const validateCategory = (category: unknown): string | null => {
  if (category === undefined) return null;
  if (typeof category !== "string") {
    return "카테고리는 문자열이어야 합니다";
  }
  if (category.length > 50) {
    return "카테고리는 50자 이하여야 합니다";
  }
  return null;
};

// ─── Routes ──────────────────────────────────────────────────────

// GET / - 서버 상태 확인
app.get("/", (_req: Request, res: Response) => {
  const dbConfig = getDatabaseConfigStatus();
  res.json({
    success: true,
    data: {
      server: "AI Todo API",
      status: {
        database: dbConnection ? "연결됨" : "연결 안됨",
        gemini: geminiModel ? "설정됨" : "설정 안됨",
      },
      dbConfig,
    },
  });
});

// POST /api/todos - 할일 생성
app.post("/api/todos", checkDbConnection, async (req: Request, res: Response) => {
  try {
    const { title, priority, category, due_date } = req.body;

    const titleError = validateTitle(title);
    if (titleError) {
      res.status(400).json({ success: false, error: titleError });
      return;
    }

    const priorityError = validatePriority(priority);
    if (priorityError) {
      res.status(400).json({ success: false, error: priorityError });
      return;
    }

    const categoryError = validateCategory(category);
    if (categoryError) {
      res.status(400).json({ success: false, error: categoryError });
      return;
    }

    const [result] = await dbConnection!.execute(
      "INSERT INTO todos (title, priority, category, due_date) VALUES (?, ?, ?, ?)",
      [
        title.trim(),
        priority || "medium",
        category || "",
        due_date || null,
      ]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;
    const [rows] = await dbConnection!.execute(
      "SELECT * FROM todos WHERE id = ?",
      [insertId]
    );
    const created = (rows as mysql.RowDataPacket[])[0];

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("할일 생성 오류:", error);
    res.status(500).json({ success: false, error: "할일 생성에 실패했습니다" });
  }
});

// GET /api/todos - 페이지네이션 할일 조회
app.get("/api/todos", checkDbConnection, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const offset = (page - 1) * limit;

    const [countResult] = await dbConnection!.execute(
      "SELECT COUNT(*) as total FROM todos"
    );
    const total = (countResult as mysql.RowDataPacket[])[0].total;
    const totalPages = Math.ceil(total / limit);

    const [rows] = await dbConnection!.execute(
      "SELECT * FROM todos ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({
      success: true,
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("할일 조회 오류:", error);
    res.status(500).json({ success: false, error: "할일 조회에 실패했습니다" });
  }
});

// GET /api/todos/:id - 단일 할일 조회
app.get("/api/todos/:id", checkDbConnection, async (req: Request, res: Response) => {
  try {
    const [rows] = await dbConnection!.execute(
      "SELECT * FROM todos WHERE id = ?",
      [req.params.id]
    );
    const todos = rows as mysql.RowDataPacket[];

    if (todos.length === 0) {
      res.status(404).json({ success: false, error: "할일을 찾을 수 없습니다" });
      return;
    }

    res.json({ success: true, data: todos[0] });
  } catch (error) {
    console.error("할일 조회 오류:", error);
    res.status(500).json({ success: false, error: "할일 조회에 실패했습니다" });
  }
});

// PATCH /api/todos/:id - 할일 수정 (부분 업데이트)
app.patch("/api/todos/:id", checkDbConnection, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, completed, priority, category, due_date } = req.body;

    const [existing] = await dbConnection!.execute(
      "SELECT * FROM todos WHERE id = ?",
      [id]
    );
    if ((existing as mysql.RowDataPacket[]).length === 0) {
      res.status(404).json({ success: false, error: "할일을 찾을 수 없습니다" });
      return;
    }

    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) {
        res.status(400).json({ success: false, error: titleError });
        return;
      }
    }

    const priorityError = validatePriority(priority);
    if (priorityError) {
      res.status(400).json({ success: false, error: priorityError });
      return;
    }

    const categoryError = validateCategory(category);
    if (categoryError) {
      res.status(400).json({ success: false, error: categoryError });
      return;
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title.trim());
    }
    if (completed !== undefined) {
      updates.push("completed = ?");
      values.push(completed);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      values.push(priority);
    }
    if (category !== undefined) {
      updates.push("category = ?");
      values.push(category);
    }
    if (due_date !== undefined) {
      updates.push("due_date = ?");
      values.push(due_date || null);
    }

    if (updates.length === 0) {
      res.status(400).json({ success: false, error: "수정할 항목이 없습니다" });
      return;
    }

    values.push(id);
    await dbConnection!.execute(
      `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [rows] = await dbConnection!.execute(
      "SELECT * FROM todos WHERE id = ?",
      [id]
    );
    const updated = (rows as mysql.RowDataPacket[])[0];

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("할일 수정 오류:", error);
    res.status(500).json({ success: false, error: "할일 수정에 실패했습니다" });
  }
});

// DELETE /api/todos/:id - 단일 할일 삭제
app.delete("/api/todos/:id", checkDbConnection, async (req: Request, res: Response) => {
  try {
    const [result] = await dbConnection!.execute(
      "DELETE FROM todos WHERE id = ?",
      [req.params.id]
    );

    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      res.status(404).json({ success: false, error: "할일을 찾을 수 없습니다" });
      return;
    }

    res.json({ success: true, data: { message: "할일이 삭제되었습니다" } });
  } catch (error) {
    console.error("할일 삭제 오류:", error);
    res.status(500).json({ success: false, error: "할일 삭제에 실패했습니다" });
  }
});

// DELETE /api/todos - 전체 할일 삭제
app.delete("/api/todos", checkDbConnection, async (_req: Request, res: Response) => {
  try {
    const [result] = await dbConnection!.execute("DELETE FROM todos");
    const deletedCount = (result as mysql.ResultSetHeader).affectedRows;

    res.json({
      success: true,
      data: { message: `${deletedCount}개의 할일이 삭제되었습니다` },
    });
  } catch (error) {
    console.error("전체 삭제 오류:", error);
    res.status(500).json({ success: false, error: "전체 삭제에 실패했습니다" });
  }
});

// POST /api/todos/:id/ai-suggest - Gemini AI 추천
app.post(
  "/api/todos/:id/ai-suggest",
  checkDbConnection,
  checkGeminiConfig,
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, error: "유효한 할일 ID가 필요합니다" });
      return;
    }

    try {
      const [rows] = await dbConnection!.execute(
        "SELECT * FROM todos WHERE id = ?",
        [id]
      );
      const todos = rows as mysql.RowDataPacket[];

      if (todos.length === 0) {
        res.status(404).json({ success: false, error: "할일을 찾을 수 없습니다" });
        return;
      }

      const todo = todos[0];

      const prompt = `You are an expert in AWS. Based on the data provided by the user, suggest one AWS service that the user can additionally learn. Ensure the response is at least three sentences long and in Korean.

사용자 입력: ${todo.title}`;

      const result = await geminiModel!.generateContent(prompt);
      const response = result.response;
      const aiSuggestion = response.text();

      await dbConnection!.execute(
        "UPDATE todos SET ai_suggestion = ?, ai_type = ? WHERE id = ?",
        [aiSuggestion, "gemini", id]
      );

      const [updatedRows] = await dbConnection!.execute(
        "SELECT * FROM todos WHERE id = ?",
        [id]
      );
      const updated = (updatedRows as mysql.RowDataPacket[])[0];

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Gemini AI API 호출 중 오류:", error);
      res.status(500).json({ success: false, error: "AI 서비스 응답에 실패했습니다" });
    }
  }
);

// ─── Error Handlers ──────────────────────────────────────────────

process.on("uncaughtException", (error) => {
  console.error("예상치 못한 오류:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("처리되지 않은 Promise 거부:", reason);
});

// ─── Server Start ────────────────────────────────────────────────

async function startServer(): Promise<void> {
  await connectToDatabase();

  app.listen(port, () => {
    printServerStatus();
  });
}

startServer();

export { app };
