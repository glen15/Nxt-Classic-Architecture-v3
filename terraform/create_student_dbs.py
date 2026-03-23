"""
학생별 데이터베이스 및 사용자 일괄 생성 스크립트

사전 조건:
  pip install pymysql

사용법:
  python3 create_student_dbs.py \
    --host <RDS 엔드포인트> \
    --admin-user <마스터 사용자명> \
    --admin-password <마스터 비밀번호> \
    --count <학생 수> \
    --start <시작 번호>
"""

import argparse
import pymysql
import sys

# ─── 설정 ────────────────────────────────────────────────────────

# RDS 접속 (CLI 인자로 전달)
# --host           RDS 엔드포인트 (필수)
# --admin-user     마스터 사용자명 (필수)
# --admin-password 마스터 비밀번호 (필수)
# --port           RDS 포트 (기본: 3306)
# --count          학생 수 (기본: 55)
# --start          시작 번호 (기본: 0)

# 학생 계정 네이밍 규칙
USER_PREFIX = "user"       # user_00, user_01, ...
DB_PREFIX = "db"           # db_00, db_01, ...
PW_PREFIX = "pw"           # pw_00, pw_01, ...

# 시드 데이터: texts 테이블 (2.RandomTextApp)
TEXTS_SEED = [
    ("인생은 짧고, 예술은 길다 ...아마도...", "히포크라테스"),
    ("나는 생각한다, 고로 존재한다 ...아마도...", "데카르트"),
    ("지식이 힘이다 ...아마도...", "프랜시스 베이컨"),
]

# 시드 데이터: todos 테이블 (3.AiTodoApp + 4.ServerlessTodo)
TODOS_SEED = [
    ("EC2 인스턴스 생성하기", "high", "AWS"),
    ("S3 버킷 정책 설정하기", "medium", "AWS"),
    ("RDS 백업 설정 확인하기", "low", "AWS"),
]

# ─── 구현 ────────────────────────────────────────────────────────


def parse_args():
    parser = argparse.ArgumentParser(description="학생별 DB/유저 일괄 생성")
    parser.add_argument("--host", required=True, help="RDS 호스트 주소")
    parser.add_argument("--port", type=int, default=3306, help="RDS 포트 (기본: 3306)")
    parser.add_argument("--admin-user", required=True, help="마스터 사용자명")
    parser.add_argument("--admin-password", required=True, help="마스터 비밀번호")
    parser.add_argument("--count", type=int, default=55, help="학생 수 (기본: 55)")
    parser.add_argument("--start", type=int, default=0, help="시작 번호 (기본: 0)")
    return parser.parse_args()


def create_student(cursor, index):
    """학생 한 명분의 DB, 유저, 테이블, 시드 데이터 생성"""
    user_name = f"{USER_PREFIX}_{index:02d}"
    db_name = f"{DB_PREFIX}_{index:02d}"
    user_password = f"{PW_PREFIX}_{index:02d}"

    # DB + 유저 + 권한
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`;")
    cursor.execute(
        f"CREATE USER IF NOT EXISTS '{user_name}'@'%%' IDENTIFIED BY '{user_password}';"
    )
    cursor.execute(f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{user_name}'@'%%';")
    cursor.execute(f"USE `{db_name}`;")

    # ── texts 테이블 (2.RandomTextApp) ──
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS texts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            text TEXT NOT NULL,
            username VARCHAR(255) NOT NULL
        );
        """
    )
    for text, username in TEXTS_SEED:
        cursor.execute(
            "INSERT INTO texts (text, username) VALUES (%s, %s)",
            (text, username),
        )

    # ── todos 테이블 (3.AiTodoApp + 4.ServerlessTodo) ──
    cursor.execute(
        """
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
        """
    )
    for title, priority, category in TODOS_SEED:
        cursor.execute(
            "INSERT INTO todos (title, priority, category) VALUES (%s, %s, %s)",
            (title, priority, category),
        )

    return user_name, db_name, user_password


def main():
    args = parse_args()

    try:
        conn = pymysql.connect(
            host=args.host,
            port=args.port,
            user=args.admin_user,
            password=args.admin_password,
        )
    except Exception as e:
        print(f"RDS 연결 실패: {e}")
        sys.exit(1)

    print(f"RDS 연결 성공: {args.host}")
    print(f"학생 {args.start}~{args.start + args.count} 생성 시작\n")

    try:
        with conn.cursor() as cursor:
            for i in range(args.start, args.start + args.count + 1):
                user_name, db_name, password = create_student(cursor, i)
                print(f"  [{i:02d}] DB={db_name}  USER={user_name}  PW={password}")

            cursor.execute("FLUSH PRIVILEGES;")
            conn.commit()
    except Exception as e:
        print(f"\n생성 중 오류: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

    print(f"\n완료: {args.start + args.count + 1}개 학생 환경 생성됨")
    print("\n학생 .env 설정 예시:")
    print(f"  DB_TYPE=mysql")
    print(f"  DB_HOST={args.host}")
    print(f"  DB_USER={USER_PREFIX}_01")
    print(f"  DB_PASSWORD={PW_PREFIX}_01")
    print(f"  DB_NAME={DB_PREFIX}_01")


if __name__ == "__main__":
    main()
