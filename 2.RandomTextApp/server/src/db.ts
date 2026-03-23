import BetterSqlite3 from "better-sqlite3";
import mysql from "mysql2/promise";
import path from "path";

// ─── Interface ──────────────────────────────────────────────────

export interface TextRow {
  id: number;
  text: string;
  username: string;
}

export interface DB {
  getRandomText(): Promise<TextRow | null>;
  getAllTexts(): Promise<TextRow[]>;
  insertText(text: string, username: string): Promise<void>;
  deleteText(id: number): Promise<boolean>;
  isConnected(): boolean;
}

// ─── SQLite ─────────────────────────────────────────────────────

function createSqliteDB(): DB {
  const dbPath =
    process.env.SQLITE_PATH || path.join(process.cwd(), "data.db");
  const db = new BetterSqlite3(dbPath);

  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS texts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      username VARCHAR(255) NOT NULL
    )
  `);

  const row = db.prepare("SELECT COUNT(*) as cnt FROM texts").get() as {
    cnt: number;
  };
  if (row.cnt === 0) {
    const insert = db.prepare(
      "INSERT INTO texts (text, username) VALUES (?, ?)",
    );
    insert.run("인생은 짧고, 예술은 길다 ...아마도...", "히포크라테스");
    insert.run("나는 생각한다, 고로 존재한다 ...아마도...", "데카르트");
    insert.run("지식이 힘이다 ...아마도...", "프랜시스 베이컨");
  }

  console.log("\n=== SQLite 연결 성공 ===");
  console.log("경로:", dbPath);
  console.log("=================\n");

  return {
    async getRandomText() {
      return (
        (db
          .prepare("SELECT * FROM texts ORDER BY RANDOM() LIMIT 1")
          .get() as TextRow) ?? null
      );
    },
    async getAllTexts() {
      return db
        .prepare("SELECT id, text, username FROM texts ORDER BY id DESC")
        .all() as TextRow[];
    },
    async insertText(text, username) {
      db.prepare("INSERT INTO texts (text, username) VALUES (?, ?)").run(
        text,
        username,
      );
    },
    async deleteText(id) {
      const result = db
        .prepare("DELETE FROM texts WHERE id = ?")
        .run(id);
      return result.changes > 0;
    },
    isConnected: () => true,
  };
}

// ─── MySQL ──────────────────────────────────────────────────────

async function createMysqlDB(): Promise<DB> {
  const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missing = required.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.error("\n=== MySQL 설정 오류 ===");
    console.error("누락된 환경변수:", missing.join(", "));
    console.error("=================\n");
    return createDisconnectedDB();
  }

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await pool.query("SELECT 1");

    console.log("\n=== MySQL 연결 성공 ===");
    console.log("Host:", process.env.DB_HOST);
    console.log("Database:", process.env.DB_NAME);
    console.log("=================\n");

    return {
      async getRandomText() {
        const [rows] = await pool.query(
          "SELECT * FROM texts ORDER BY RAND() LIMIT 1",
        );
        const results = rows as TextRow[];
        return results[0] ?? null;
      },
      async getAllTexts() {
        const [rows] = await pool.query(
          "SELECT id, text, username FROM texts ORDER BY id DESC",
        );
        return rows as TextRow[];
      },
      async insertText(text, username) {
        await pool.query(
          "INSERT INTO texts (text, username) VALUES (?, ?)",
          [text, username],
        );
      },
      async deleteText(id) {
        const [result] = await pool.query(
          "DELETE FROM texts WHERE id = ?",
          [id],
        );
        return (result as mysql.ResultSetHeader).affectedRows > 0;
      },
      isConnected: () => true,
    };
  } catch (error) {
    console.error("\n=== MySQL 연결 실패 ===");
    console.error(error);
    console.error("=================\n");
    return createDisconnectedDB();
  }
}

// ─── Disconnected (fallback) ────────────────────────────────────

function createDisconnectedDB(): DB {
  return {
    getRandomText: () => Promise.reject(new Error("DB 미연결")),
    getAllTexts: () => Promise.reject(new Error("DB 미연결")),
    insertText: () => Promise.reject(new Error("DB 미연결")),
    deleteText: () => Promise.reject(new Error("DB 미연결")),
    isConnected: () => false,
  };
}

// ─── Factory ────────────────────────────────────────────────────

export async function createDB(): Promise<DB> {
  const dbType = process.env.DB_TYPE || "sqlite";
  console.log("DB 타입:", dbType);

  if (dbType === "mysql") {
    return createMysqlDB();
  }

  return createSqliteDB();
}
