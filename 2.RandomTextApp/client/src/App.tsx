import { useState, useEffect, FormEvent } from "react";
import "./index.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

function App() {
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [displayedAuthor, setDisplayedAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRandomText();
  }, []);

  const fetchRandomText = async () => {
    try {
      setError(null);
      const response = await fetch(`${SERVER_URL}/api/text`);

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      const parts = data.text.split("by");
      setDisplayedText(parts[0] || "");
      setDisplayedAuthor(parts[1] || "");
    } catch (err) {
      console.error("명언 조회 중 오류:", err);
      setError("서버와 연결할 수 없습니다.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !username.trim()) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, username }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "저장에 실패했습니다.");
        return;
      }

      setText("");
      setUsername("");
      await fetchRandomText();
    } catch (err) {
      console.error("명언 저장 중 오류:", err);
      setError("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>확신없는 랜덤 명언</h1>

        <div className="quote-section">
          {error ? (
            <p className="error-text">{error}</p>
          ) : (
            <>
              <h2 className="quote-text">
                {displayedText || "아직 저장된 명언이 없거나 서버와 연결되지 않았습니다."}
              </h2>
              {displayedAuthor && (
                <h3 className="quote-author">by {displayedAuthor}</h3>
              )}
            </>
          )}
          <button onClick={fetchRandomText} className="secondary-button">
            다른 명언 보기
          </button>
        </div>

        <div className="input-section">
          <h2>새 명언 등록</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="명언을 입력하세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-input"
            />
            <input
              type="text"
              placeholder="작성자 이름"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-input"
            />
            <button
              type="submit"
              disabled={!text.trim() || !username.trim()}
              className="primary-button"
            >
              명언 저장
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
