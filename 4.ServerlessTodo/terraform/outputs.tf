output "gemini_lambda_url" {
  description = "Gemini Lambda Function URL"
  value       = aws_lambda_function_url.gemini.function_url
}

output "bedrock_lambda_url" {
  description = "Bedrock Lambda Function URL"
  value       = aws_lambda_function_url.bedrock.function_url
}
