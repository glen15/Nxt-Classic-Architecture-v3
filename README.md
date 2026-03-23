# Nxt-Classic-Architecture-v3

3티어 아키텍처(3-Tier Architecture) 교육용 프로젝트입니다.
기본 웹 서버부터 서버리스 + IaC까지 단계별로 학습합니다.

## 프로젝트 구조

```
Nxt-Classic-Architecture-v3/
├── 1.Tutorial/                        # 기초 튜토리얼
│   ├── 1.SimpleServer/                # EC2 배포 (JS + Python)
│   ├── 2.html/                        # S3 정적 웹페이지
│   └── 3.StreamlitApp/               # 단일 아키텍처의 한계
├── 2.RandomTextApp/                   # 3-Tier 랜덤 명언 (CRUD)
├── 3.AiTodoApp/                       # 3-Tier + Gemini AI
├── 4.ServerlessTodo/                  # 서버리스 + Lambda + Terraform
├── terraform/                         # RDS 생성 + 학생 DB 일괄 생성
└── e2e/                               # Playwright E2E 테스트
```

## 학습 흐름

| 단계 | 핵심 개념 | 아키텍처 |
|------|-----------|----------|
| 1.SimpleServer | EC2 배포, 언어 무관 (JS/Python) | 단일 서버 |
| 1.html | S3 정적 호스팅 | 정적 웹페이지 |
| 1.StreamlitApp | 단일 아키텍처의 한계 | 모놀리식 |
| 2.RandomTextApp | Express + SQLite/MySQL, CRUD | 3-Tier |
| 3.AiTodoApp | Gemini AI API, 페이지네이션 | 3-Tier + AI |
| 4.ServerlessTodo | Lambda + Terraform | 서버리스 + IaC |

## 기술 스택

| 구분 | 기술 |
|------|------|
| 언어 | TypeScript, Python |
| 프론트엔드 | React 18, Vite 5, Streamlit |
| 백엔드 | Express 4, Flask |
| 데이터베이스 | SQLite, MySQL 8 (RDS) |
| AI 서비스 | Google Gemini, AWS Bedrock (Nova) |
| 서버리스 | AWS Lambda |
| IaC | Terraform |
| 테스트 | Vitest, Playwright |

## 시작하기

각 프로젝트 폴더의 README와 `.env.example`을 참고하세요.

```bash
git clone <repo-url>
cd Nxt-Classic-Architecture-v3

# 예: 2번 프로젝트 서버 실행
cd 2.RandomTextApp/server
cp .env.example .env
npm install
npm run dev
```
