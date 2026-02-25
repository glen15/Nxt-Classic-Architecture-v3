# 1. Tutorial - 기초 튜토리얼

웹 서버의 기본 개념부터 2티어 아키텍처까지 단계별로 학습합니다.

## 학습 목표

- HTTP 서버의 동작 원리 이해
- 동일한 API를 Python/JavaScript 두 언어로 구현
- 정적 파일과 API 서버의 분리 (2티어 아키텍처)
- 단일 아키텍처의 한계 이해

## 프로젝트 구조

```
1.Tutorial/
├── 1.SimpleServer/      # EC2 배포 실습용 API 서버
│   ├── js/              # Node.js TypeScript 버전
│   └── python/          # Python Flask 버전
├── 2.html/              # S3 정적 웹페이지 (클라이언트)
└── 3.StreamlitApp/      # 단일 아키텍처 예시
```

---

## 실행 순서

### Step 1. 단일 아키텍처 체험 (StreamlitApp)

> 먼저 UI + 로직이 한 프로세스에서 돌아가는 구조를 체험합니다.

```bash
cd 1.Tutorial/3.StreamlitApp

# 의존성 설치
pip install -r requirements.txt

# 앱 실행
streamlit run app.py
```

- 접속: http://localhost:8501 (자동으로 브라우저 열림)
- 할일 추가/완료/삭제를 테스트
- 데이터는 메모리에만 저장 (새로고침하면 유지, 서버 재시작 시 사라짐)

**단일 아키텍처의 문제점 확인:**
1. UI 버그 → 로직도 멈춤
2. 사용자 증가 → 서버 부하 집중
3. 배포 시 전체 재배포 필요

---

### Step 2. API 서버 실행 (SimpleServer)

> 비즈니스 로직만 담당하는 API 서버를 실행합니다. Python 또는 JS 중 택 1.

#### Option A: Python 버전

```bash
cd 1.Tutorial/1.SimpleServer/python

pip install -r requirements.txt
python server.py
```

#### Option B: JavaScript(TypeScript) 버전

```bash
cd 1.Tutorial/1.SimpleServer/js

npm install
npm run dev
```

- 서버 포트: **8080**
- 테스트: `curl http://localhost:8080/api/todos`

**API 엔드포인트:**

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/todos` | 모든 할일 조회 |
| POST | `/api/todos` | 할일 추가 (`{ "title": "..." }`) |
| PATCH | `/api/todos/:id` | 할일 수정 (완료 토글, 제목 변경) |
| DELETE | `/api/todos/:id` | 할일 삭제 |

---

### Step 3. 클라이언트 실행 (html)

> 별도 프로세스에서 UI를 실행하여 2티어 분리를 확인합니다.

```bash
cd 1.Tutorial/2.html

# 간단한 HTTP 서버로 실행
python3 -m http.server 8000
```

- 접속: http://localhost:8000
- **Step 2의 API 서버가 실행 중이어야** 동작합니다
- 할일 추가/완료/삭제가 API를 통해 처리되는 것을 확인

---

### Step 4. S3 배포 (선택)

```bash
cd 1.Tutorial/2.html

# AWS CLI 인증 설정 필요
./s3.sh <버킷이름>
```

배포 후 접속: `http://<버킷이름>.s3-website-ap-northeast-2.amazonaws.com`

---

## 아키텍처 비교

```
[단일 아키텍처 - StreamlitApp]
┌──────────────────────┐
│ UI + 로직 + 데이터   │  ← 한 프로세스
└──────────────────────┘

[2티어 아키텍처 - SimpleServer + html]
┌──────────┐     ┌──────────────┐
│ 클라이언트│────→│ API 서버     │
│ (S3)     │ HTTP│ (EC2)        │
│ 포트 8000│←────│ 포트 8080    │
└──────────┘     └──────────────┘
```

## 사전 조건

- Python 3.x
- Node.js 20+ (JS 버전 사용 시)
- AWS CLI (S3 배포 시)
