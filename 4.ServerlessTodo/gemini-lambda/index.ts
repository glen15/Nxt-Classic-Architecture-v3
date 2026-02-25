import { GoogleGenerativeAI } from "@google/generative-ai";
import mysql from "mysql2";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult | string> => {
  console.log("EC2 -> Lambda로 전달된 데이터", event.body);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let inputData: { content: string; todoId: number };
  try {
    inputData = JSON.parse(event.body || "");
  } catch {
    return { statusCode: 400, body: "Invalid JSON format" };
  }

  if (!inputData?.content || !inputData?.todoId) {
    return { statusCode: 400, body: "No content or todoId provided" };
  }
  if (typeof inputData.content !== "string" || !inputData.content.trim()) {
    return { statusCode: 400, body: "content must be a non-empty string" };
  }
  if (!Number.isInteger(inputData.todoId) || inputData.todoId <= 0) {
    return { statusCode: 400, body: "todoId must be a positive integer" };
  }

  const userMessage = inputData.content;
  const todoId = inputData.todoId;

  try {
    const prompt = `You are an expert in AWS. Based on the data provided by the user, suggest one AWS service that the user can additionally learn. Ensure the response is at least three sentences long and in Korean.\n\nUser input: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    const db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    db.connect();

    const sql = "UPDATE todos SET ai_suggestion = ?, ai_type = ? WHERE id = ?";
    await new Promise<void>((resolve, reject) => {
      db.query(sql, [aiResponse, "gemini", todoId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
    db.end();

    return aiResponse;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Lambda function error");
  }
};
