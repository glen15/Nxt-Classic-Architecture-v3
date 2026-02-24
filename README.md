# Nxt-Classic-Architecture-v3

## 📚 프로젝트 개요

이 레포지토리는 **3티어 아키텍처(3-Tier Architecture)** 에 대한 이해와 실습을 제공하기 위한 교육용 프로젝트입니다.
기본적인 웹 서버부터 복잡한 서버리스 아키텍처까지 단계별로 학습할 수 있도록 구성되어 있습니다.

## 🆕 v3 변경사항 (v2 대비)

- **버그 수정**: Nova Lambda 응답 저장 시 `ai_type`이 `'claude'`로 잘못 기록되던 버그 수정
- **미사용 의존성 제거**: `openai` 패키지 제거 (실제로 사용하지 않음)
- **ENUM 정리**: `ai_type` 컬럼에서 사용하지 않는 값(`gpt`, `claude`) 제거
- **입력 검증 강화**: 모든 API 엔드포인트에 타입/길이 검증 추가
- **페이지네이션**: `GET /notes`에 `?page=&limit=` 쿼리 파라미터 지원, `{data, meta}` 응답 형식

## 🏗️ 3티어 아키텍처란?

3티어 아키텍처는 애플리케이션을 세 개의 논리적 계층으로 분리하는 소프트웨어 아키텍처 패턴입니다:

- **프레젠테이션 티어 (Presentation Tier)**: 사용자 인터페이스 계층
- **애플리케이션 티어 (Application Tier)**: 비즈니스 로직 처리 계층
- **데이터 티어 (Data Tier)**: 데이터 저장 및 관리 계층

## 📁 프로젝트 구조

```
Nxt-Classic-Architecture-v3/
├── 1.Tutorial/              # 기초 튜토리얼
│   ├── 1.SimpleServer/      # 간단한 서버 구현
│   ├── 2.html/             # 정적 웹페이지
│   └── 3.Resume/           # React 기반 이력서 앱
├── 2.RandomTextApp/        # 3티어 랜덤 명언 앱
├── 3.AiNoteApp/           # 3티어 AI 노트 앱
└── 4.lambda/              # 서버리스 아키텍처
```

## 🎯 학습 목표

1. **기본 웹 서버 이해**: HTTP 서버의 동작 원리
2. **3티어 아키텍처 구현**: 완전한 웹 애플리케이션 개발
3. **데이터베이스 연동**: 백엔드와 데이터베이스 통합
4. **AI 서비스 활용**: 클라우드 AI 서비스 연동
5. **서버리스 아키텍처**: 람다 기반 마이크로서비스

## 📖 실습 가이드

### 1️⃣ 기초 튜토리얼 (`1.Tutorial/`)

#### 1-1. 간단한 서버 (`1.SimpleServer/`)

**Python 서버 (Streamlit)**

```bash
cd 1.Tutorial/1.SimpleServer/
pip install streamlit
streamlit run app.py
```

**Node.js 서버**

```bash
cd 1.Tutorial/1.SimpleServer/
node server.js
```

- **학습 내용**: HTTP 서버 기본 동작 원리
- **기술 스택**: Python(Streamlit), Node.js

#### 1-2. React 이력서 앱 (`3.Resume/`)

```bash
cd 1.Tutorial/3.Resume/
npm install
npm start
```

- **학습 내용**: React 기반 SPA, 차트 라이브러리 활용
- **기술 스택**: React, Recharts, Tailwind CSS
- **특징**: 다크모드, 인터랙티브 차트, 반응형 디자인

### 2️⃣ 랜덤 명언 앱 (`2.RandomTextApp/`)

#### 📊 아키텍처 구조

```
[React Client] ↔ [Express Server] ↔ [MySQL Database]
  (프레젠테이션)    (애플리케이션)      (데이터)
```

#### 🚀 실행 방법

**데이터베이스 설정**

```sql
-- MySQL 데이터베이스 생성
CREATE DATABASE texts;
USE texts;
CREATE TABLE texts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    username VARCHAR(255) NOT NULL
);
-- 초기 데이터 삽입 (db.sql 참조)
```

**백엔드 서버 실행**

```bash
cd 2.RandomTextApp/server/
npm install
# .env 파일 설정 필요 (DB 연결 정보)
npm start
```

**프론트엔드 실행**

```bash
cd 2.RandomTextApp/client/
npm install
# .env 파일에 REACT_APP_SERVER_URL 설정
npm start
```

#### 🔧 기술 스택

- **Frontend**: React, CSS
- **Backend**: Node.js, Express, MySQL
- **Database**: MySQL (RDS 권장)

#### 💡 주요 기능

- 랜덤 명언 조회
- 새로운 명언 저장 (자동으로 "...아마도..." 추가)
- 데이터베이스 연결 상태 모니터링

### 3️⃣ AI 노트 앱 (`3.AiNoteApp/`)

#### 📊 아키텍처 구조

```
[React Client] ↔ [Express Server + Gemini AI] ↔ [MySQL Database]
  (프레젠테이션)        (애플리케이션)              (데이터)
```

#### 🚀 실행 방법

**환경 변수 설정**

```bash
# .env 파일
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
GEMINI_API_KEY=your_gemini_api_key
```

**백엔드 서버 실행**

```bash
cd 3.AiNoteApp/server/
npm install
npm start
```

**프론트엔드 실행**

```bash
cd 3.AiNoteApp/client/
npm install
npm start
```

#### 🔧 기술 스택

- **Frontend**: React, CSS
- **Backend**: Node.js, Express, Google Generative AI
- **Database**: MySQL (자동 테이블 생성)

#### 💡 주요 기능

- 학습 노트 작성 및 저장
- Gemini AI를 통한 AWS 서비스 추천
- 노트 관리 (조회, 삭제)

### 4️⃣ 서버리스 아키텍처 (`4.lambda/`)

#### 📊 아키텍처 구조

```
[React Client] ↔ [Express Server] ↔ [Lambda Functions] ↔ [Database]
  (프레젠테이션)     (애플리케이션)       (마이크로서비스)      (데이터)
```

#### 🚀 실행 방법

**Lambda 함수 배포**

- `bedrock-lambda/`: AWS Bedrock 기반 AI 서비스
- `gemini-lambda/`: Google Gemini AI 서비스

**백엔드 서버 실행**

```bash
cd 4.lambda/server/
npm install
npm start
```

**프론트엔드 실행**

```bash
cd 4.lambda/client/
npm install
npm start
```

#### 🔧 기술 스택

- **Frontend**: React
- **Backend**: Node.js, Express
- **Serverless**: AWS Lambda, Python, Node.js
- **AI Services**: AWS Bedrock (Nova), Google Gemini
- **Database**: MySQL

#### 💡 주요 기능

- 멀티 AI 서비스 지원 (Gemini, AWS Nova)
- 서버리스 마이크로서비스 아키텍처
- 실시간 AI 응답 처리

## 🛠️ 개발 환경 설정

### 필수 요구사항

- **Node.js** 14+
- **Python** 3.8+
- **MySQL** 5.7+
- **AWS 계정** (Lambda, Bedrock 사용시)
- **Google Cloud 계정** (Gemini API 사용시)

### 권장 개발 도구

- **IDE**: VSCode, WebStorm
- **Database**: MySQL Workbench, DBeaver
- **API 테스트**: Postman, Thunder Client

## 🌟 학습 단계별 가이드

### 초급 단계

1. `1.Tutorial/1.SimpleServer/` - 기본 서버 이해
2. `1.Tutorial/3.Resume/` - React 기초 학습
3. `2.RandomTextApp/` - 3티어 아키텍처 기본

### 중급 단계

1. `3.AiNoteApp/` - AI 서비스 연동
2. `4.lambda/` - 서버리스 아키텍처
3. 클라우드 배포 (AWS EC2, S3, RDS)

### 고급 단계

1. CI/CD 파이프라인 구축
2. 모니터링 및 로깅 구현
3. 보안 강화 (HTTPS, 인증)
4. 성능 최적화

## 📚 추가 학습 자료

### 아키텍처 패턴

- [3-Tier Architecture 상세 설명](https://docs.aws.amazon.com/whitepapers/latest/serverless-multi-tier-architectures-api-gateway-lambda/three-tier-architecture-overview.html)
- [마이크로서비스 아키텍처](https://aws.amazon.com/microservices/)

### 클라우드 서비스

- [AWS Lambda 시작하기](https://docs.aws.amazon.com/lambda/)
- [AWS Bedrock 문서](https://docs.aws.amazon.com/bedrock/)
- [Google Gemini API](https://ai.google.dev/docs)

### 개발 도구

- [React 공식 문서](https://reactjs.org/docs)
- [Express.js 가이드](https://expressjs.com/ko/guide/)
- [MySQL 튜토리얼](https://dev.mysql.com/doc/)

---

**즐거운 학습되세요! 🚀**
