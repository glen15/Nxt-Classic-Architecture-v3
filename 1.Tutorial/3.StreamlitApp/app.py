import streamlit as st
from datetime import datetime

# ─── 단일 아키텍처: UI + 로직이 하나의 파일에 결합 ───
# 이 앱에서는 화면(표현)과 비즈니스 로직이 분리되어 있지 않습니다.
# 장점: 간단하고 빠르게 만들 수 있다
# 단점: UI가 망가지면 로직도 멈추고, 로직이 망가지면 UI도 멈춘다
#       → 이것이 2티어/3티어 아키텍처가 필요한 이유입니다

# ─── 데이터 (in-memory) ─────────────────────────────────
if "todos" not in st.session_state:
    st.session_state.todos = []
if "next_id" not in st.session_state:
    st.session_state.next_id = 1


# ─── 비즈니스 로직 ───────────────────────────────────────
def add_todo(title: str):
    """할일 추가 - 로직과 UI가 같은 프로세스에서 동작"""
    if not title.strip():
        return
    todo = {
        "id": st.session_state.next_id,
        "title": title.strip(),
        "completed": False,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    st.session_state.todos.append(todo)
    st.session_state.next_id += 1


def toggle_todo(todo_id: int):
    """완료 토글"""
    for todo in st.session_state.todos:
        if todo["id"] == todo_id:
            todo["completed"] = not todo["completed"]
            break


def delete_todo(todo_id: int):
    """할일 삭제"""
    st.session_state.todos = [t for t in st.session_state.todos if t["id"] != todo_id]


def get_stats():
    """통계 계산"""
    total = len(st.session_state.todos)
    done = sum(1 for t in st.session_state.todos if t["completed"])
    return total, done


# ─── UI (표현) ───────────────────────────────────────────
# 로직과 분리되어 있지 않음 - 같은 파일, 같은 프로세스

st.set_page_config(page_title="Todo App", page_icon="✅", layout="centered")
st.title("✅ Todo App")
st.caption("단일 아키텍처 - UI와 로직이 하나의 프로세스에서 동작합니다")

# 통계
total, done = get_stats()
col1, col2, col3 = st.columns(3)
col1.metric("전체", total)
col2.metric("완료", done)
col3.metric("미완료", total - done)

st.divider()

# 할일 추가 폼
with st.form("add_form", clear_on_submit=True):
    title = st.text_input("할 일", placeholder="할 일을 입력하세요", max_chars=200)
    submitted = st.form_submit_button("추가", use_container_width=True)
    if submitted and title:
        add_todo(title)
        st.rerun()

# 할일 목록
if not st.session_state.todos:
    st.info("등록된 할 일이 없습니다.")
else:
    for todo in st.session_state.todos:
        col_check, col_title, col_delete = st.columns([0.5, 8, 1])

        with col_check:
            if st.checkbox(
                "완료",
                value=todo["completed"],
                key=f"check_{todo['id']}",
                label_visibility="collapsed",
            ):
                if not todo["completed"]:
                    toggle_todo(todo["id"])
                    st.rerun()
            else:
                if todo["completed"]:
                    toggle_todo(todo["id"])
                    st.rerun()

        with col_title:
            if todo["completed"]:
                st.markdown(f"~~{todo['title']}~~")
            else:
                st.write(todo["title"])

        with col_delete:
            if st.button("🗑", key=f"del_{todo['id']}"):
                delete_todo(todo["id"])
                st.rerun()

# ─── 교육 포인트 ─────────────────────────────────────────
st.divider()
with st.expander("💡 왜 이 구조가 문제일까?"):
    st.markdown("""
**이 앱은 단일 아키텍처입니다:**
- 화면(UI)과 로직이 같은 파일, 같은 프로세스에서 실행
- 데이터는 메모리에 저장 → 앱을 재시작하면 사라짐

**문제점:**
1. UI 코드에 버그가 있으면 → 로직도 멈춤
2. 로직에 에러가 나면 → 화면도 멈춤
3. 사용자가 많아지면 → 서버 하나에 부하 집중
4. 배포 시 → 화면만 바꾸고 싶어도 전체를 재배포해야 함

**해결:** 2티어/3티어 아키텍처로 분리
- **2티어**: 클라이언트(S3) + 서버(EC2)
- **3티어**: 클라이언트(S3) + 서버(EC2) + 데이터베이스(RDS)
""")
