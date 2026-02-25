from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory 저장소
todos = []
next_id = 1


@app.route("/api/todos", methods=["GET"])
def get_todos():
    return jsonify({"success": True, "data": todos})


@app.route("/api/todos", methods=["POST"])
def create_todo():
    global next_id
    body = request.get_json(silent=True) or {}
    title = body.get("title")

    if not title or not isinstance(title, str) or not title.strip():
        return jsonify({"success": False, "error": "제목을 입력해주세요"}), 400
    if len(title) > 200:
        return jsonify({"success": False, "error": "제목은 200자 이하여야 합니다"}), 400

    todo = {
        "id": next_id,
        "title": title.strip(),
        "completed": False,
        "created_at": datetime.now().isoformat(),
    }
    next_id += 1
    todos.append(todo)
    return jsonify({"success": True, "data": todo}), 201


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    body = request.get_json(silent=True) or {}
    todo = next((t for t in todos if t["id"] == todo_id), None)

    if not todo:
        return jsonify({"success": False, "error": "할일을 찾을 수 없습니다"}), 404

    if "title" in body and isinstance(body["title"], str):
        todo["title"] = body["title"].strip()
    if "completed" in body and isinstance(body["completed"], bool):
        todo["completed"] = body["completed"]

    return jsonify({"success": True, "data": todo})


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    global todos
    exists = any(t["id"] == todo_id for t in todos)
    if not exists:
        return jsonify({"success": False, "error": "할일을 찾을 수 없습니다"}), 404

    todos = [t for t in todos if t["id"] != todo_id]
    return jsonify({"success": True, "data": {"message": "할일이 삭제되었습니다"}})


if __name__ == "__main__":
    print(f"Todo API 서버가 8080번 포트에서 실행 중입니다. (Python)")
    print(f"API: http://localhost:8080/api/todos")
    app.run(host="0.0.0.0", port=8080)
