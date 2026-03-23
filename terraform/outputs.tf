output "rds_endpoint" {
  description = "RDS 엔드포인트 (호스트:포트)"
  value       = aws_db_instance.main.endpoint
}

output "rds_host" {
  description = "RDS 호스트 (포트 제외)"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS 포트"
  value       = aws_db_instance.main.port
}

output "master_username" {
  description = "마스터 사용자명"
  value       = var.db_master_username
}

output "student_count" {
  description = "생성할 학생 수"
  value       = var.student_count
}

output "next_step" {
  description = "다음 단계 안내"
  value       = "python3 create_student_dbs.py --host <rds_host> --admin-user ${var.db_master_username} --admin-password <password> --count ${var.student_count}"
}
