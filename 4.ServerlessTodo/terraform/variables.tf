variable "region" {
  description = "AWS 리전"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
  default     = "serverless-todo"
}

variable "db_host" {
  description = "데이터베이스 호스트"
  type        = string
  sensitive   = true
}

variable "db_user" {
  description = "데이터베이스 사용자"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "데이터베이스 비밀번호"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "데이터베이스 이름"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini API 키"
  type        = string
  sensitive   = true
}

variable "pymysql_layer_arn" {
  description = "PyMySQL Lambda Layer ARN"
  type        = string
  default     = ""
}
