import json
import os
import boto3
import pymysql


def lambda_handler(event, context):
    print("EC2 -> Lambda로 전달된 데이터", event["body"])

    try:
        input_data = json.loads(event["body"])
    except (json.JSONDecodeError, TypeError):
        return {"statusCode": 400, "body": "Invalid JSON format"}

    if not input_data.get("content") or not input_data.get("todoId"):
        return {"statusCode": 400, "body": "No content or todoId provided"}

    content = input_data["content"]
    todo_id = input_data["todoId"]

    if not isinstance(content, str) or not content.strip():
        return {"statusCode": 400, "body": "content must be a non-empty string"}

    if not isinstance(todo_id, int) or todo_id <= 0:
        return {"statusCode": 400, "body": "todoId must be a positive integer"}

    try:
        bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

        user_message = (
            "You are an expert in AWS. Based on the data provided by the user, "
            "suggest one AWS service that the user can additionally learn. "
            "Ensure the response is at least three sentences long and in Korean.\n\n"
            f"User input: {content}"
        )

        response = bedrock.converse(
            modelId="us.amazon.nova-lite-v1:0",
            messages=[{"role": "user", "content": [{"text": user_message}]}],
            inferenceConfig={"maxTokens": 1000, "temperature": 0.7},
        )

        ai_response = response["output"]["message"]["content"][0]["text"]

        connection = pymysql.connect(
            host=os.environ["DB_HOST"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ["DB_NAME"],
            cursorclass=pymysql.cursors.DictCursor,
        )

        with connection:
            with connection.cursor() as cursor:
                sql = "UPDATE todos SET ai_suggestion = %s, ai_type = %s WHERE id = %s"
                cursor.execute(sql, (ai_response, "nova", todo_id))
            connection.commit()

        return ai_response

    except Exception as e:
        print(f"Error: {e}")
        raise Exception("Lambda function error")
