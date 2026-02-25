import { useState, useEffect, useCallback } from "react";
import { Todo, ApiResponse, PaginatedResponse } from "./types";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost";

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

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [aiLoading, setAiLoading] = useState<number | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos?page=${page}&limit=10`);
      const json: ApiResponse<Todo[]> & { meta?: PaginatedResponse<Todo>["meta"] } =
        await res.json();

      if (json.success && json.data) {
        setTodos(json.data);
        if (json.meta) {
          setTotalPages(json.meta.totalPages);
          setTotal(json.meta.total);
        }
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
      const json: ApiResponse<Todo> = await res.json();

      if (json.success) {
        setTitle("");
        setCategory("");
        setDueDate("");
        setPriority("medium");
        setError("");
        setPage(1);
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

  const deleteAllTodos = async () => {
    if (!window.confirm("모든 할일을 삭제하시겠습니까?")) return;
    try {
      await fetch(`${API_URL}/api/todos`, { method: "DELETE" });
      setPage(1);
      fetchTodos();
    } catch {
      setError("전체 삭제에 실패했습니다");
    }
  };

  const requestAiSuggest = async (id: number) => {
    setAiLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}/ai-suggest`, {
        method: "POST",
      });
      const json: ApiResponse<Todo> = await res.json();

      if (!json.success) {
        setError(json.error || "AI 추천에 실패했습니다");
      }
      fetchTodos();
    } catch {
      setError("AI 서비스에 연결할 수 없습니다");
    } finally {
      setAiLoading(null);
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
      <h1>AI Todo App</h1>
      <p className="subtitle">Gemini AI가 AWS 학습을 추천해드립니다</p>

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

      <div className="list-header">
        <span className="total-count">전체 {total}건</span>
        <button onClick={deleteAllTodos} className="btn-delete-all">
          전체 삭제
        </button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
            <div className="todo-main">
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
                {!todo.ai_suggestion && (
                  <button
                    onClick={() => requestAiSuggest(todo.id)}
                    disabled={aiLoading === todo.id}
                    className="btn-ai"
                  >
                    {aiLoading === todo.id ? "AI 분석 중..." : "AI 추천"}
                  </button>
                )}
                <button onClick={() => deleteTodo(todo.id)} className="btn-delete">
                  삭제
                </button>
              </div>
            </div>

            {todo.ai_suggestion && (
              <div className="ai-suggestion">
                <strong>Gemini AI 추천:</strong>
                <p>{todo.ai_suggestion}</p>
              </div>
            )}
          </li>
        ))}
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
