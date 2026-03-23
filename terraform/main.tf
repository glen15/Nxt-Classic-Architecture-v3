terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── Default VPC + Security Group ────────────────────────────────

data "aws_vpc" "default" {
  default = true
}

data "aws_security_group" "default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}

# ─── RDS Instance ───────────────────────────────────────────────

resource "aws_db_instance" "main" {
  identifier = "nxt-${var.group_name}-3tier"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp3"

  username = var.db_master_username
  password = var.db_master_password

  vpc_security_group_ids = [data.aws_security_group.default.id]
  publicly_accessible    = true

  skip_final_snapshot       = true
  final_snapshot_identifier = "nxt-${var.group_name}-3tier-final"

  backup_retention_period = 0

  tags = {
    Name  = "nxt-${var.group_name}-3tier"
    Group = var.group_name
  }
}
