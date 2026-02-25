import { test, expect } from "@playwright/test";

// SimpleServer API (http://localhost:8080) e2e 테스트
// DB 없이 in-memory로 동작하므로 독립 실행 가능

test.describe("SimpleServer API", () => {
  test("GET /api/todos - 초기 상태 빈 배열", async ({ request }) => {
    const res = await request.get("/api/todos");
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  test("POST /api/todos - 할일 추가", async ({ request }) => {
    const res = await request.post("/api/todos", {
      data: { title: "Playwright 테스트 할일" },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBe("Playwright 테스트 할일");
    expect(body.data.completed).toBe(false);
    expect(body.data.id).toBeDefined();
  });

  test("POST /api/todos - 빈 제목이면 400", async ({ request }) => {
    const res = await request.post("/api/todos", {
      data: { title: "" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("제목");
  });

  test("POST /api/todos - 200자 초과하면 400", async ({ request }) => {
    const res = await request.post("/api/todos", {
      data: { title: "a".repeat(201) },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("CRUD 전체 흐름", async ({ request }) => {
    // 1. 생성
    const createRes = await request.post("/api/todos", {
      data: { title: "CRUD 테스트" },
    });
    const created = await createRes.json();
    const todoId = created.data.id;

    // 2. 조회 확인
    const listRes = await request.get("/api/todos");
    const list = await listRes.json();
    const found = list.data.find(
      (t: { id: number }) => t.id === todoId
    );
    expect(found).toBeDefined();
    expect(found.title).toBe("CRUD 테스트");

    // 3. 수정 (완료 토글)
    const patchRes = await request.patch(`/api/todos/${todoId}`, {
      data: { completed: true },
    });
    const patched = await patchRes.json();
    expect(patched.data.completed).toBe(true);

    // 4. 삭제
    const deleteRes = await request.delete(`/api/todos/${todoId}`);
    expect(deleteRes.ok()).toBeTruthy();

    // 5. 삭제 확인
    const afterDelete = await request.get("/api/todos");
    const afterList = await afterDelete.json();
    const notFound = afterList.data.find(
      (t: { id: number }) => t.id === todoId
    );
    expect(notFound).toBeUndefined();
  });

  test("DELETE - 존재하지 않는 ID는 404", async ({ request }) => {
    const res = await request.delete("/api/todos/99999");
    expect(res.status()).toBe(404);
  });

  test("PATCH - 존재하지 않는 ID는 404", async ({ request }) => {
    const res = await request.patch("/api/todos/99999", {
      data: { completed: true },
    });
    expect(res.status()).toBe(404);
  });
});
