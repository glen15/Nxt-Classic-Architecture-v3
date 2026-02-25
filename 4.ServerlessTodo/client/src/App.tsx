import { useState, useEffect, useCallback } from "react";
import { Todo, PaginatedResponse } from "./types";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:80";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

interface AiRequest {
  id: number | null;
  type: "gemini" | "nova" | null;
}

function getAIDisplayInfo(aiType: "gemini" | "nova" | null) {
  if (aiType === "gemini") return { icon: "🤖", label: "Gemini" };
  if (aiType === "nova") return { icon: "🌟", label: "Nova" };
  return { icon: "", label: "" };
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [aiRequest, setAiRequest] = useState<AiRequest>({ id: null, type: null });

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos?page=${page}&limit=10`);
      const json: { success: boolean; error?: string } & PaginatedResponse<Todo> =
        await res.json();
      if (json.success && json.data) {
        setTodos(json.data);
        setTotalPages(json.meta.totalPages);
      }
    } catch {
      setError("서버에 연결할 수 없습니다");
    }
  }, [page]);

  useEffect(() => {
    fetchTodos();
    const interval = setInterval(fetchTodos, 10000);
    return () => clearInterval(interval);
  }, [fetchTodos]);

  const addTodo = async () => {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          priority,
          category: category.trim(),
          due_date: dueDate || null,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setTitle("");
        setCategory("");
        setDueDate("");
        setPriority("medium");
        setError("");
        fetchTodos();
      } else {
        setError(json.error || "추가에 실패했습니다");
      }
    } catch {
      setError("서버에 연결할 수 없습니다");
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      await fetch(`${API_URL}/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      fetchTodos();
    } catch {
      setError("수정에 실패했습니다");
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/todos/${id}`, { method: "DELETE" });
      fetchTodos();
    } catch {
      setError("삭제에 실패했습니다");
    }
  };

  const requestAiSuggestion = async (id: number, type: "gemini" | "nova") => {
    setAiRequest({ id, type });
    setError("");

    try {
      const endpoint = type === "gemini" ? "gemini-suggest" : "nova-suggest";
      const res = await fetch(`${API_URL}/api/todos/${id}/${endpoint}`, {
        method: "POST",
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error || `${type} 추천 요청에 실패했습니다`);
      }
      fetchTodos();
    } catch {
      setError(`${type} 서비스에 연결할 수 없습니다`);
    } finally {
      setAiRequest({ id: null, type: null });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addTodo();
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ko-KR");
  };

  return (
    <div className="container">
      <h1>Serverless Todo App</h1>

      {error && <div className="error">{error}</div>}

      <div className="input-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력하세요"
          className="input-title"
        />

        <div className="input-row">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
            className="input-priority"
          >
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="카테고리"
            className="input-category"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-date"
          />

          <button onClick={addTodo} className="btn-add">
            추가
          </button>
        </div>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => {
          const aiInfo = getAIDisplayInfo(todo.ai_type);
          const isLoading = aiRequest.id === todo.id;

          return (
            <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
              <div className="todo-content">
                <div className="todo-left">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                  />
                  <span
                    className="priority-dot"
                    style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }}
                    title={PRIORITY_LABELS[todo.priority]}
                  />
                  <span className="todo-title">{todo.title}</span>
                </div>

                <div className="todo-right">
                  {todo.category && <span className="todo-category">{todo.category}</span>}
                  {todo.due_date && (
                    <span className="todo-date">{formatDate(todo.due_date)}</span>
                  )}
                  <div className="ai-buttons">
                    <button
                      onClick={() => requestAiSuggestion(todo.id, "gemini")}
                      disabled={isLoading}
                      className="btn-ai btn-gemini"
                    >
                      🤖 Gemini
                    </button>
                    <button
                      onClick={() => requestAiSuggestion(todo.id, "nova")}
                      disabled={isLoading}
                      className="btn-ai btn-nova"
                    >
                      🌟 Nova
                    </button>
                  </div>
                  <button onClick={() => deleteTodo(todo.id)} className="btn-delete">
                    삭제
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="loading-state">
                  {aiRequest.type === "gemini" ? "🤖" : "🌟"}{" "}
                  {aiRequest.type === "gemini" ? "Gemini" : "Nova"}가 분석 중...
                </div>
              )}

              {todo.ai_suggestion && (
                <div className="ai-suggestion">
                  <span className="ai-badge">
                    {aiInfo.icon} {aiInfo.label}
                  </span>
                  <p>{todo.ai_suggestion}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {todos.length === 0 && <p className="empty">할 일이 없습니다</p>}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-page"
          >
            이전
          </button>
          <span className="page-info">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-page"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
