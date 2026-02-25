# Nxt-Classic-Architecture-v4

## 프로젝트 개요

이 레포지토리는 **3티어 아키텍처(3-Tier Architecture)** 에 대한 이해와 실습을 제공하기 위한 교육용 프로젝트입니다.
기본적인 웹 서버부터 서버리스 + IaC 아키텍처까지 단계별로 학습할 수 있도록 구성되어 있습니다.

## v4 변경사항 (v3 대비)

- **TypeScript 전면 도입**: 서버 + 클라이언트 모두 TypeScript
- **Vite + React 전환**: CRA(deprecated) → Vite 기반 빌드
- **Terraform 추가**: 4단계에 IaC(Infrastructure as Code) 정의
- **테스트 추가**: Vitest로 검증 함수 단위 테스트, Playwright로 E2E 테스트
- **Tutorial 재구성**: JS+Python 서버, S3 배포, Streamlit 단일 아키텍처
- **도메인 유지**: 2단계는 랜덤 명언(CRUD), 3-4단계는 할일(Todo)+AI

## 3티어 아키텍처란?

3티어 아키텍처는 애플리케이션을 세 개의 논리적 계층으로 분리하는 소프트웨어 아키텍처 패턴입니다:

- **프레젠테이션 티어 (Presentation Tier)**: 사용자 인터페이스 계층
- **애플리케이션 티어 (Application Tier)**: 비즈니스 로직 처리 계층
- **데이터 티어 (Data Tier)**: 데이터 저장 및 관리 계층

## 프로젝트 구조

```
Nxt-Classic-Architecture-v4/
├── README.md
├── .gitignore
├── e2e/                               # Playwright E2E 테스트
├── 1.Tutorial/                        # 기초 튜토리얼
│   ├── 1.SimpleServer/                # EC2 배포 실습
│   │   ├── js/                        # Node.js TypeScript 서버
│   │   └── python/                    # Python Flask 서버
│   ├── 2.html/                        # S3 정적 웹페이지 배포
│   └── 3.StreamlitApp/               # 단일 아키텍처 (UI+로직 결합)
├── 2.RandomTextApp/                   # 3-Tier 랜덤 명언 앱 (CRUD, AI 없음)
│   ├── server/
│   └── client/
├── 3.AiTodoApp/                       # 3-Tier + AI: Gemini + 페이지네이션
│   ├── server/
│   └── client/
└── 4.ServerlessTodo/                  # 서버리스: Express + Lambda + Terraform
    ├── server/
    ├── client/
    ├── gemini-lambda/                 # Node.js TS Lambda (Gemini)
    ├── bedrock-lambda/                # Python Lambda (Bedrock Nova)
    └── terraform/                     # IaC 정의
```

## 학습 흐름

```
1.SimpleServer  → "배포"의 의미. 인프라는 내부 코드 언어를 모른다 (JS든 Python이든 EC2에서 실행)
     ↓
1.html          → S3 정적 웹페이지 배포. EC2 배포와 S3 배포의 차이
     ↓
1.StreamlitApp  → UI+로직 결합된 단일 아키텍처. 한쪽이 망가지면 전부 무너짐
     ↓ "그래서 분리해야 한다"
2.RandomTextApp → S3 + EC2 + RDS (3티어 학습). AI 없는 순수 CRUD 앱
     ↓
3.AiTodoApp     → 같은 3티어 + 외부 Gemini AI API 호출 추가
     ↓
4.ServerlessTodo → AI 기능을 Lambda로 분리. 서버와 Lambda의 언어가 다를 수 있음
                   (JS→Gemini, Python→Bedrock Nova)
```

## 단계별 학습 가이드

### 단계별 새 개념 (최대 2개씩)

| 단계 | 새 개념 | 아키텍처 |
|------|---------|----------|
| 1.SimpleServer | EC2 배포, 언어 무관 (JS/Python) | 단일 서버 |
| 1.html | S3 정적 호스팅, DOM/fetch | 정적 웹페이지 |
| 1.StreamlitApp | Streamlit, 단일 아키텍처의 한계 | 모놀리식 (UI+로직) |
| 2.RandomTextApp | Express + MySQL, CRUD | 3-Tier (S3+EC2+RDS) |
| 3.AiTodoApp | Gemini AI API, 페이지네이션 | 3-Tier + AI |
| 4.ServerlessTodo | Lambda + Terraform | 서버리스 + IaC |

---

## 실행 방법

### 필수 요구사항

- **Node.js** 18+
- **Python** 3.10+
- **MySQL** 8.0+
- **Terraform** 1.0+ (4단계)
- **AWS 계정** (Lambda, Bedrock 사용시)
- **Google Cloud 계정** (Gemini API 사용시)

### 1단계: 기초 튜토리얼

#### 1-1. SimpleServer (JS + Python 서버)

> **학습 목표**: EC2에서 서버를 실행하고 퍼블릭 IP로 접근. 인프라는 내부 코드 언어를 모른다.

**JavaScript 서버**

```bash
cd 1.Tutorial/1.SimpleServer/js/
npm install
npm run dev
# http://localhost:8080/api/todos
```

**Python 서버** (같은 API, 다른 언어)

```bash
cd 1.Tutorial/1.SimpleServer/python/
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
# http://localhost:8080/api/todos
```

두 서버 모두 동일한 Todo CRUD API를 제공합니다.
EC2에서 어떤 언어로 만든 서버든 퍼블릭 IP로 동일하게 접근할 수 있음을 보여줍니다.

#### 1-2. HTML (S3 정적 웹페이지)

> **학습 목표**: S3로 정적 웹페이지 배포. 2티어로 가기 전 S3/EC2 배포 개념 학습.

```bash
# SimpleServer(JS)가 실행 중인 상태에서 index.html을 브라우저로 열기
open 1.Tutorial/2.html/index.html

# S3 배포
cd 1.Tutorial/2.html/
bash s3.sh <버킷이름>
```

- fetch()로 SimpleServer API 연동
- DOM 조작으로 할일 추가/완료/삭제

#### 1-3. StreamlitApp (단일 아키텍처)

> **학습 목표**: UI와 로직이 하나의 프로세스에서 동작하는 모놀리식 구조.
> 한쪽이 망가지면 전부 무너지는 문제를 체험 → 2티어/3티어 분리의 필요성 인식.

```bash
cd 1.Tutorial/3.StreamlitApp/
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
# http://localhost:8501
```

- UI + 비즈니스 로직 + 데이터가 하나의 파일에 결합
- 앱 재시작 시 데이터 소멸 (in-memory)
- **이 한계가 3티어 아키텍처로 가는 이유**

### 2단계: RandomTextApp (3-Tier, CRUD만)

> 3단계(AiTodoApp)와 **같은 인프라(S3+EC2+RDS)** 를 사용하지만 **완전히 다른 앱**입니다.
> 같은 아키텍처 위에서 다른 도메인이 돌아가는 것을 보여줍니다.

```
[Vite React Client] ↔ [Express TS Server] ↔ [MySQL Database]
  (프레젠테이션)         (애플리케이션)          (데이터)
```

**데이터베이스 설정**

```sql
-- db.sql 참고
CREATE DATABASE IF NOT EXISTS texts;
USE texts;
CREATE TABLE IF NOT EXISTS texts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    username VARCHAR(255) NOT NULL
);
```

**서버 실행**

```bash
cd 2.RandomTextApp/server/
npm install
# .env 파일 설정 (.env.example 참고)
npm run dev
# http://localhost:8000
```

**클라이언트 실행**

```bash
cd 2.RandomTextApp/client/
npm install
# .env 파일에 VITE_SERVER_URL=http://localhost:8000
npm run dev
# http://localhost:3000
```

**테스트 실행**

```bash
cd 2.RandomTextApp/server/
npm test
```

**환경변수 (.env)**

```
DB_HOST=your_database_host
DB_USER=user_00
DB_PASSWORD=pw_00
DB_NAME=db_00
```

**API 엔드포인트**

| Method | Path | 설명 |
|--------|------|------|
| GET | / | 서버 상태 확인 (DB 설정 노출) |
| GET | /api/text | 랜덤 명언 1개 조회 |
| POST | /api/text | 새 명언 저장 ("...아마도..." 자동 추가) |

### 3단계: AiTodoApp (3-Tier + AI)

```
[Vite React Client] ↔ [Express TS + Gemini AI] ↔ [MySQL Database]
```

**서버 실행**

```bash
cd 3.AiTodoApp/server/
npm install
# .env 파일 설정 (.env.example 참고)
npm run dev
```

**클라이언트 실행**

```bash
cd 3.AiTodoApp/client/
npm install
npm run dev
```

**테스트 실행**

```bash
cd 3.AiTodoApp/server/
npm test
```

**환경변수 (.env)**

```
DB_HOST=your_database_host
DB_USER=user_00
DB_PASSWORD=pw_00
DB_NAME=db_00
GEMINI_API_KEY=your_gemini_api_key
```

**추가 API 엔드포인트**

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/todos?page=1&limit=10 | 페이지네이션 조회 |
| POST | /api/todos/:id/ai-suggest | Gemini AI 추천 요청 |

### 4단계: ServerlessTodo (서버리스 + IaC)

> AI 기능을 Lambda로 분리. 서버와 Lambda의 언어가 다를 수 있음을 보여줍니다.
> JS Lambda → 외부 Gemini 호출, Python Lambda → AWS Bedrock Nova 호출.

```
[Vite React Client] ↔ [Express TS Server] ↔ [Lambda Functions] ↔ [MySQL + AI]
                                                 ├─ Gemini Lambda (Node.js TS)
                                                 └─ Bedrock Lambda (Python)
```

**Lambda 함수 배포**

- `gemini-lambda/`: Google Gemini AI 서비스 (Node.js TypeScript)
- `bedrock-lambda/`: AWS Bedrock Nova AI 서비스 (Python + PyMySQL Layer)

**Terraform으로 인프라 배포**

```bash
cd 4.ServerlessTodo/terraform/
cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars 편집 (DB 접속정보, API 키 등)
terraform init
terraform plan
terraform apply
```

**서버 실행**

```bash
cd 4.ServerlessTodo/server/
npm install
# .env 파일 설정
npm run dev
```

**클라이언트 실행**

```bash
cd 4.ServerlessTodo/client/
npm install
npm run dev
```

**테스트 실행**

```bash
cd 4.ServerlessTodo/server/
npm test
```

**환경변수 (.env)**

```
DB_HOST=your_database_host
DB_USER=user_00
DB_PASSWORD=pw_00
DB_NAME=db_00
GEMINI_LAMBDA_URL=https://xxx.lambda-url.us-east-1.on.aws/
BEDROCK_LAMBDA_URL=https://yyy.lambda-url.us-east-1.on.aws/
```

**추가 API 엔드포인트**

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/todos/:id/gemini-suggest | Gemini Lambda 호출 |
| POST | /api/todos/:id/nova-suggest | Nova Lambda 호출 |

## 기술 스택

| 구분 | 기술 |
|------|------|
| 언어 | TypeScript, Python |
| 프론트엔드 | React 18, Vite 5, Streamlit |
| 백엔드 | Express 4, Flask, Node.js HTTP |
| 데이터베이스 | MySQL 8 |
| AI 서비스 | Google Gemini, AWS Bedrock (Nova) |
| 서버리스 | AWS Lambda |
| IaC | Terraform |
| 테스트 | Vitest, Playwright |

## LLM 실행/보고 가이드

### 설치 및 실행 절차 (LLM이 사용자에게 안내할 내용)

1. `git clone` 후 원하는 단계 디렉토리로 이동
2. Node.js 프로젝트: `npm install`로 의존성 설치
3. Python 프로젝트: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
4. `.env.example`을 복사하여 `.env` 파일 생성 및 값 입력
5. `npm run dev` 또는 `python3 server.py` / `streamlit run app.py`로 실행

### 완료/실패/롤백 항목 (LLM이 사용자에게 보고할 내용)

- **완료**: 서버 시작 시 콘솔에 DB 연결 상태 표시
- **실패**: 환경변수 누락 시 명확한 에러 메시지 출력
- **롤백**: `DELETE /api/todos`로 전체 데이터 초기화 가능

## 추가 학습 자료

- [3-Tier Architecture 상세 설명](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/three-tier-architecture-overview.html)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Vite 가이드](https://vitejs.dev/guide/)
- [React 공식 문서](https://react.dev/)
- [Express.js 가이드](https://expressjs.com/ko/guide/)
- [Streamlit 공식 문서](https://docs.streamlit.io/)
- [Flask 공식 문서](https://flask.palletsprojects.com/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda 시작하기](https://docs.aws.amazon.com/lambda/)
- [Google Gemini API](https://ai.google.dev/docs)
