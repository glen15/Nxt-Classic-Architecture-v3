# Gemini Lambda 함수
resource "aws_lambda_function" "gemini" {
  function_name = "${var.project_name}-gemini"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  role          = aws_iam_role.lambda_role.arn
  timeout       = 30
  memory_size   = 256

  filename         = "${path.module}/../gemini-lambda/gemini-lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../gemini-lambda/gemini-lambda.zip")

  environment {
    variables = {
      GEMINI_API_KEY = var.gemini_api_key
      DB_HOST        = var.db_host
      DB_USER        = var.db_user
      DB_PASSWORD    = var.db_password
      DB_NAME        = var.db_name
    }
  }
}

resource "aws_lambda_function_url" "gemini" {
  function_name      = aws_lambda_function.gemini.function_name
  authorization_type = "NONE"
}

# Bedrock Lambda 함수
resource "aws_lambda_function" "bedrock" {
  function_name = "${var.project_name}-bedrock"
  runtime       = "python3.12"
  handler       = "lambda_function.lambda_handler"
  role          = aws_iam_role.lambda_role.arn
  timeout       = 30
  memory_size   = 256

  filename         = "${path.module}/../bedrock-lambda/bedrock-lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../bedrock-lambda/bedrock-lambda.zip")

  layers = [var.pymysql_layer_arn]

  environment {
    variables = {
      DB_HOST     = var.db_host
      DB_USER     = var.db_user
      DB_PASSWORD = var.db_password
      DB_NAME     = var.db_name
    }
  }
}

resource "aws_lambda_function_url" "bedrock" {
  function_name      = aws_lambda_function.bedrock.function_name
  authorization_type = "NONE"
}
