variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "us-east-1"
}

variable "group_name" {
  description = "수업 그룹 이름 (예: monday-am, team-a) — RDS 식별자에 포함됨"
  type        = string
}

variable "db_master_username" {
  description = "RDS 마스터 사용자명"
  type        = string
  default     = "admin"
}

variable "db_master_password" {
  description = "RDS 마스터 비밀번호"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS 인스턴스 타입"
  type        = string
  default     = "db.t3.micro"
}

variable "student_count" {
  description = "생성할 학생 수"
  type        = number
  default     = 55
}
