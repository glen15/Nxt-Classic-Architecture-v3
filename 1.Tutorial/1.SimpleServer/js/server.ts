import http from "http";

// Todo 타입 정의
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

// In-memory 저장소
let todos: Todo[] = [];
let nextId = 1;

const port = 8080;

// JSON 응답 헬퍼
const sendJson = (res: http.ServerResponse, statusCode: number, data: unknown) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
};

// 요청 바디 파싱
const parseBody = (req: http.IncomingMessage): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
};

// URL에서 ID 추출
const extractId = (url: string): number | null => {
  const match = url.match(/\/api\/todos\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // CORS Preflight
  if (method === "OPTIONS") {
    sendJson(res, 204, null);
    return;
  }

  try {
    // GET /api/todos - 전체 조회
    if (method === "GET" && url === "/api/todos") {
      sendJson(res, 200, { success: true, data: todos });
      return;
    }

    // POST /api/todos - 할일 추가
    if (method === "POST" && url === "/api/todos") {
      const body = await parseBody(req);
      const title = body.title;

      if (!title || typeof title !== "string" || !String(title).trim()) {
        sendJson(res, 400, { success: false, error: "제목을 입력해주세요" });
        return;
      }
      if (String(title).length > 200) {
        sendJson(res, 400, { success: false, error: "제목은 200자 이하여야 합니다" });
        return;
      }

      const todo: Todo = {
        id: nextId++,
        title: String(title).trim(),
        completed: false,
        created_at: new Date().toISOString(),
      };
      todos = [...todos, todo];

      sendJson(res, 201, { success: true, data: todo });
      return;
    }

    // PATCH /api/todos/:id - 할일 수정 (완료 토글)
    const patchId = method === "PATCH" && url ? extractId(url) : null;
    if (method === "PATCH" && patchId) {
      const body = await parseBody(req);
      const index = todos.findIndex((t) => t.id === patchId);

      if (index === -1) {
        sendJson(res, 404, { success: false, error: "할일을 찾을 수 없습니다" });
        return;
      }

      const updated = {
        ...todos[index],
        ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
        ...(typeof body.completed === "boolean" ? { completed: body.completed } : {}),
      };
      todos = todos.map((t) => (t.id === patchId ? updated : t));

      sendJson(res, 200, { success: true, data: updated });
      return;
    }

    // DELETE /api/todos/:id - 할일 삭제
    const deleteId = method === "DELETE" && url ? extractId(url) : null;
    if (method === "DELETE" && deleteId) {
      const exists = todos.some((t) => t.id === deleteId);
      if (!exists) {
        sendJson(res, 404, { success: false, error: "할일을 찾을 수 없습니다" });
        return;
      }

      todos = todos.filter((t) => t.id !== deleteId);
      sendJson(res, 200, { success: true, data: { message: "할일이 삭제되었습니다" } });
      return;
    }

    // 404
    sendJson(res, 404, { success: false, error: "Not Found" });
  } catch (error) {
    console.error("서버 오류:", error);
    sendJson(res, 500, { success: false, error: "서버 오류가 발생했습니다" });
  }
});

server.listen(port, () => {
  console.log(`Todo API 서버가 ${port}번 포트에서 실행 중입니다.`);
  console.log(`API: http://localhost:${port}/api/todos`);
});
