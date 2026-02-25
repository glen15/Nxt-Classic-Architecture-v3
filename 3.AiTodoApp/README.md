# 3. AiTodoApp - 3티어 + AI Todo 앱

2단계의 3티어 아키텍처에 **Gemini AI 추천 기능**을 추가한 Todo 앱입니다.
우선순위, 카테고리, 마감일, 페이지네이션을 지원합니다.

## 학습 목표

- 3티어 아키텍처에 외부 AI API 연동
- 페이지네이션 구현 (서버 + 클라이언트)
- 우선순위/카테고리 등 복잡한 CRUD
- Google Gemini API 활용

## 프로젝트 구조

```
3.AiTodoApp/
├── server/                    # Express + MySQL + Gemini
│   ├── src/server.ts          # 메인 서버 파일
│   ├── __tests__/             # Vitest 단위 테스트
│   └── .env.example
└── client/                    # React + Vite + TypeScript
    ├── src/App.tsx            # 메인 컴포넌트
    ├── src/types.ts           # 타입 정의
    └── .env.example
```

## 아키텍처

```
┌──────────┐     ┌──────────────┐     ┌─────────┐
│ React    │────→│ Express API  │────→│ MySQL   │
│ (Vite)   │ HTTP│ (Node.js)   │ SQL │         │
│ 포트 3000│←────│ 포트 80      │←────│ 포트 3306│
└──────────┘     └──────────────┘     └─────────┘
                       │
                       │ HTTPS
                       ▼
                 ┌───────────┐
                 │ Google    │
                 │ Gemini AI │
                 └───────────┘
```

---

## 실행 순서

### Step 1. Gemini API 키 발급

1. https://aistudio.google.com/ 접속
2. API Key 생성
3. 키를 메모해 둡니다

---

### Step 2. MySQL 준비

서버 실행 시 `todos` 테이블이 **자동 생성**됩니다. 별도 SQL 실행은 불필요합니다.

**자동 생성되는 테이블:**

```sql
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
);
```

---

### Step 3. 서버 실행

```bash
cd 3.AiTodoApp/server

# 환경변수 설정
cp .env.example .env
```

`.env` 파일을 열어 입력합니다:

```
DB_HOST=localhost
DB_USER=<사용자명>
DB_PASSWORD=<비밀번호>
DB_NAME=<데이터베이스명>
GEMINI_API_KEY=<Step 1에서 발급한 키>
```

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

- 서버 포트: **80**
- 상태 확인: `curl http://localhost`

---

### Step 4. 클라이언트 실행

```bash
cd 3.AiTodoApp/client

# 환경변수 설정
cp .env.example .env
```

`.env` 파일 확인:

```
VITE_SERVER_URL=http://localhost
```

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

- 접속: http://localhost:3000

---

### Step 5. 기능 테스트

1. **할일 추가**: 제목, 우선순위(low/medium/high), 카테고리, 마감일 입력
2. **AI 추천**: 할일 항목의 "AI 추천" 버튼 클릭 → Gemini가 AWS 학습 제안 생성
3. **페이지네이션**: 할일 10개 이상 추가 후 페이지 이동 확인
4. **완료 토글**: 체크박스 클릭
5. **삭제**: 개별 삭제 및 전체 삭제

---

### Step 6. 테스트 실행

```bash
cd 3.AiTodoApp/server

npm run test          # 단위 테스트
npm run test:watch    # 감시 모드
```

**테스트 항목:**
- `validateTitle()` - 제목 검증 (필수, 최대 200자)
- `validatePriority()` - 우선순위 검증 (low/medium/high)
- `validateCategory()` - 카테고리 검증 (최대 50자)

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 서버 상태 (DB/Gemini 연결 확인) |
| POST | `/api/todos` | 할일 생성 |
| GET | `/api/todos?page=1&limit=10` | 할일 목록 (페이지네이션) |
| GET | `/api/todos/:id` | 단일 할일 조회 |
| PATCH | `/api/todos/:id` | 할일 수정 (부분 업데이트) |
| DELETE | `/api/todos/:id` | 단일 삭제 |
| DELETE | `/api/todos` | 전체 삭제 |
| POST | `/api/todos/:id/ai-suggest` | Gemini AI 추천 생성 |

## 입력 검증 규칙

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| title | string | O | 1~200자 |
| priority | enum | X | low / medium / high (기본: medium) |
| category | string | X | 최대 50자 |
| due_date | date | X | YYYY-MM-DD 형식 |

## 사전 조건

- Node.js 20+
- MySQL
- Google Gemini API Key
