# 4. ServerlessTodo - 서버리스 + IaC Todo 앱

3단계의 AI Todo 앱을 **서버리스 아키텍처**로 전환합니다.
AI 기능을 AWS Lambda로 분리하고, Terraform으로 인프라를 코드로 관리합니다.

## 학습 목표

- 서버리스 아키텍처 이해 (Lambda + Function URL)
- 오케스트레이터 패턴 (Express → Lambda 호출)
- Terraform으로 IaC(Infrastructure as Code) 실습
- 두 가지 AI 서비스 비교 (Google Gemini vs Amazon Nova)

## 프로젝트 구조

```
4.ServerlessTodo/
├── server/                # Express 오케스트레이터 (EC2)
│   ├── src/server.ts
│   ├── __tests__/
│   └── .env.example
├── client/                # React + Vite (S3)
│   ├── src/App.tsx
│   ├── src/types.ts
│   └── .env.example
├── gemini-lambda/         # Gemini AI Lambda (Node.js TS)
│   ├── index.ts
│   └── package.json
├── bedrock-lambda/        # Amazon Nova Lambda (Python)
│   ├── lambda_function.py
│   └── layer.md
└── terraform/             # IaC 정의
    ├── main.tf
    ├── variables.tf
    ├── lambda.tf
    ├── iam.tf
    └── outputs.tf
```

## 아키텍처

```
┌──────────┐     ┌──────────────┐     ┌─────────┐
│ React    │────→│ Express      │────→│ MySQL   │
│ (S3)     │ HTTP│ (EC2)        │ SQL │ (RDS)   │
│ 포트 3000│←────│ 포트 80      │←────│         │
└──────────┘     └──────┬───────┘     └─────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
     ┌──────────────┐   ┌──────────────┐
     │ Gemini       │   │ Bedrock      │
     │ Lambda       │   │ Lambda       │
     │ (Node.js TS) │   │ (Python)     │
     │ Google AI    │   │ Amazon Nova  │
     └──────────────┘   └──────────────┘
```

---

## 실행 순서

### Part A. 로컬 개발 (Lambda 배포 전)

> Lambda 없이 서버 + 클라이언트만 먼저 실행합니다. CRUD 기능만 동작합니다.

#### Step 1. MySQL 준비

서버 실행 시 `todos` 테이블이 자동 생성됩니다.

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
  ai_type ENUM('gemini', 'nova') DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Step 2. 서버 실행

```bash
cd 4.ServerlessTodo/server

cp .env.example .env
```

`.env` 파일을 열어 입력합니다:

```
DB_HOST=localhost
DB_USER=<사용자명>
DB_PASSWORD=<비밀번호>
DB_NAME=<데이터베이스명>
GEMINI_LAMBDA_URL=     # Lambda 배포 후 입력
BEDROCK_LAMBDA_URL=    # Lambda 배포 후 입력
```

```bash
npm install
npm run dev
```

- 서버 포트: **80**
- 상태 확인: `curl http://localhost`

#### Step 3. 클라이언트 실행

```bash
cd 4.ServerlessTodo/client

cp .env.example .env
```

`.env` 파일 확인:

```
VITE_SERVER_URL=http://localhost:80
```

```bash
npm install
npm run dev
```

- 접속: http://localhost:3000
- CRUD 기능 테스트 (AI 추천은 Lambda 배포 후 동작)

---

### Part B. Lambda 배포 (Terraform)

> AI 기능을 위해 Lambda 함수를 AWS에 배포합니다.

#### Step 4. Gemini Lambda 빌드

```bash
cd 4.ServerlessTodo/gemini-lambda

npm install
npm run build

# 배포 패키지 생성
cd dist
zip -r ../gemini-lambda.zip .
cd ..
```

#### Step 5. Bedrock Lambda 빌드

```bash
cd 4.ServerlessTodo/bedrock-lambda

# Python 파일만 zip으로 패키징
zip -r bedrock-lambda.zip lambda_function.py
```

> PyMySQL Lambda Layer가 필요합니다. `layer.md`를 참고하세요.

#### Step 6. Terraform 배포

```bash
cd 4.ServerlessTodo/terraform

# terraform.tfvars 파일 생성
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` 파일을 열어 입력합니다:

```hcl
region         = "us-east-1"
db_host        = "<RDS 엔드포인트>"
db_user        = "<DB 사용자명>"
db_password    = "<DB 비밀번호>"
db_name        = "<데이터베이스명>"
gemini_api_key = "<Gemini API 키>"
pymysql_layer_arn = "<PyMySQL Layer ARN>"
```

```bash
# Terraform 실행
terraform init
terraform plan      # 리소스 확인
terraform apply     # 배포 (yes 입력)
```

배포 완료 후 출력되는 Lambda URL을 확인합니다:

```
Outputs:
  gemini_lambda_url  = "https://xxxxx.lambda-url.us-east-1.on.aws/"
  bedrock_lambda_url = "https://yyyyy.lambda-url.us-east-1.on.aws/"
```

#### Step 7. 서버에 Lambda URL 연결

서버의 `.env` 파일에 Lambda URL을 추가합니다:

```
GEMINI_LAMBDA_URL=https://xxxxx.lambda-url.us-east-1.on.aws/
BEDROCK_LAMBDA_URL=https://yyyyy.lambda-url.us-east-1.on.aws/
```

서버를 재시작하면 AI 추천 기능이 동작합니다.

---

### Part C. 기능 테스트

#### Step 8. 전체 기능 확인

1. **CRUD**: 할일 추가/조회/수정/삭제
2. **Gemini 추천**: 할일의 "Gemini" 버튼 클릭 → Google AI 제안
3. **Nova 추천**: 할일의 "Nova" 버튼 클릭 → Amazon AI 제안
4. **페이지네이션**: 10개 이상 할일 추가 후 페이지 이동
5. **AI 비교**: 같은 할일에 대해 Gemini vs Nova 결과 비교

#### Step 9. 테스트 실행

```bash
cd 4.ServerlessTodo/server

npm run test          # 단위 테스트
npm run test:watch    # 감시 모드
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 서버 상태 (DB/Lambda 연결 확인) |
| POST | `/api/todos` | 할일 생성 |
| GET | `/api/todos?page=1&limit=10` | 할일 목록 (페이지네이션) |
| GET | `/api/todos/:id` | 단일 할일 조회 |
| PATCH | `/api/todos/:id` | 할일 수정 |
| DELETE | `/api/todos/:id` | 단일 삭제 |
| DELETE | `/api/todos` | 전체 삭제 |
| POST | `/api/todos/:id/gemini-suggest` | Gemini Lambda 호출 |
| POST | `/api/todos/:id/nova-suggest` | Bedrock Lambda 호출 |

## Lambda 함수 비교

| 항목 | Gemini Lambda | Bedrock Lambda |
|------|---------------|----------------|
| 런타임 | Node.js 20.x | Python 3.12 |
| AI 모델 | Gemini 2.5 Flash | Amazon Nova Lite v1 |
| 인증 | Gemini API Key | AWS IAM (Bedrock 권한) |
| DB 접근 | mysql2 | pymysql (Layer) |
| 타임아웃 | 30초 | 30초 |
| 메모리 | 256MB | 256MB |

## Terraform 리소스

| 리소스 | 설명 |
|--------|------|
| `aws_lambda_function` x2 | Gemini + Bedrock Lambda |
| `aws_lambda_function_url` x2 | 외부 접근용 URL |
| `aws_iam_role` | Lambda 실행 역할 |
| `aws_iam_policy` | Bedrock 호출 권한 |

## 정리 (리소스 삭제)

```bash
cd 4.ServerlessTodo/terraform

terraform destroy    # 모든 AWS 리소스 삭제 (yes 입력)
```

## 사전 조건

- Node.js 20+
- Python 3.12 (Bedrock Lambda)
- MySQL
- AWS CLI + 인증 설정
- Terraform 1.0+
- Google Gemini API Key
