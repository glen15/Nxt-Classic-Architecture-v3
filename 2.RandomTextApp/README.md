# 2. RandomTextApp - 3티어 랜덤 명언 앱

클라이언트 + 서버 + 데이터베이스로 구성된 3티어 아키텍처 실습입니다.
AI 없이 순수 CRUD 기능만 구현합니다.

## 학습 목표

- 3티어 아키텍처 (클라이언트 / 서버 / DB) 구현
- TypeScript + Express REST API 개발
- React + Vite 프론트엔드 개발
- MySQL 데이터베이스 연동
- 입력 검증 및 에러 처리

## 프로젝트 구조

```
2.RandomTextApp/
├── server/                    # Express + MySQL 백엔드
│   ├── src/server.ts          # 메인 서버 파일
│   ├── __tests__/             # Vitest 단위 테스트
│   ├── db.sql                 # DB 초기화 스크립트
│   └── .env.example
└── client/                    # React + Vite 프론트엔드
    ├── src/App.tsx            # 메인 컴포넌트
    ├── src/main.tsx           # 진입점
    └── .env.example
```

## 아키텍처

```
┌──────────┐     ┌──────────────┐     ┌─────────┐
│ React    │────→│ Express API  │────→│ MySQL   │
│ (Vite)   │ HTTP│ (Node.js)   │ SQL │         │
│ 포트 3000│←────│ 포트 8000    │←────│ 포트 3306│
└──────────┘     └──────────────┘     └─────────┘
```

---

## 실행 순서

### Step 1. MySQL 준비

```bash
# MySQL 접속
mysql -u root -p

# db.sql 실행 (데이터베이스 + 테이블 + 샘플 데이터 생성)
mysql -u root -p < 2.RandomTextApp/server/db.sql
```

**생성되는 테이블:**

```sql
CREATE TABLE texts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,         -- 명언 내용
    username VARCHAR(255) NOT NULL  -- 작성자
);
```

샘플 데이터 3건이 자동으로 입력됩니다.

---

### Step 2. 서버 실행

```bash
cd 2.RandomTextApp/server

# 환경변수 설정
cp .env.example .env
```

`.env` 파일을 열어 DB 정보를 입력합니다:

```
DB_HOST=localhost
DB_USER=<사용자명>
DB_PASSWORD=<비밀번호>
DB_NAME=<db.sql에서 생성한 DB 이름>
```

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (자동 리로드)
npm run dev
```

- 서버 포트: **8000**
- 상태 확인: `curl http://localhost:8000`

**API 엔드포인트:**

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 서버 상태 (DB 연결 확인) |
| GET | `/api/text` | 랜덤 명언 1개 조회 |
| POST | `/api/text` | 명언 저장 (`{ "text": "...", "username": "..." }`) |

---

### Step 3. 클라이언트 실행

```bash
cd 2.RandomTextApp/client

# 환경변수 설정
cp .env.example .env
```

`.env` 파일 확인:

```
VITE_SERVER_URL=http://localhost:8000
```

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

- 접속: http://localhost:3000
- "다른 명언 보기" 버튼으로 랜덤 명언 조회
- 명언 + 작성자를 입력하여 새로운 명언 저장

---

### Step 4. 테스트 실행

```bash
cd 2.RandomTextApp/server

# 단위 테스트
npm run test

# 감시 모드 (파일 변경 시 자동 재실행)
npm run test:watch
```

**테스트 항목:**
- `validateText()` - 명언 텍스트 검증 (빈값, 타입, 길이 500자)
- `validateUsername()` - 작성자명 검증 (빈값, 타입, 길이 100자)

---

## 입력 검증 규칙

| 필드 | 타입 | 필수 | 최대 길이 |
|------|------|------|-----------|
| text | string | O | 500자 |
| username | string | O | 100자 |

## 사전 조건

- Node.js 20+
- MySQL
