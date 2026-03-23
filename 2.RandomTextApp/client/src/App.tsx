import { useState, useEffect, FormEvent } from "react";
import "./index.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

interface TextItem {
  id: number;
  text: string;
  username: string;
}

function App() {
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [displayedAuthor, setDisplayedAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [allTexts, setAllTexts] = useState<TextItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

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

  const fetchAllTexts = async () => {
    try {
      setListLoading(true);
      const response = await fetch(`${SERVER_URL}/api/texts`);

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      setAllTexts(data.texts);
      setShowList(true);
    } catch (err) {
      console.error("목록 조회 중 오류:", err);
      setError("목록을 불러올 수 없습니다.");
    } finally {
      setListLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/text/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status}`);
      }

      setAllTexts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("삭제 중 오류:", err);
      setError("삭제에 실패했습니다.");
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
          <div className="button-row">
            <button onClick={fetchRandomText} className="secondary-button">
              다른 명언 보기
            </button>
            <button
              onClick={fetchAllTexts}
              className="secondary-button"
              disabled={listLoading}
            >
              {listLoading ? "로딩 중..." : "전체 목록"}
            </button>
          </div>
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

      {showList && (
        <div className="modal-overlay" onClick={() => setShowList(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>전체 명언 목록</h2>
              <button className="close-button" onClick={() => setShowList(false)}>
                닫기
              </button>
            </div>
            {allTexts.length === 0 ? (
              <p className="empty-list">저장된 명언이 없습니다.</p>
            ) : (
              allTexts.map((item) => (
                <div key={item.id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-text">{item.text}</div>
                    <div className="list-item-author">- {item.username}</div>
                  </div>
                  <button
                    className="danger-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
