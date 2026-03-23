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

# ─── Default VPC ─────────────────────────────────────────────────

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ─── Security Group ──────────────────────────────────────────────

resource "aws_security_group" "rds" {
  name        = "rds-${var.group_name}-sg"
  description = "Allow MySQL access for ${var.group_name}"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "MySQL from anywhere (education)"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name  = "rds-${var.group_name}-sg"
    Group = var.group_name
  }
}

# ─── DB Subnet Group ────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "rds-${var.group_name}-subnet"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name  = "rds-${var.group_name}-subnet"
    Group = var.group_name
  }
}

# ─── RDS Instance ───────────────────────────────────────────────

resource "aws_db_instance" "main" {
  identifier = "rds-${var.group_name}"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp3"

  username = var.db_master_username
  password = var.db_master_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true

  skip_final_snapshot       = true
  final_snapshot_identifier = "rds-${var.group_name}-final"

  backup_retention_period = 0

  tags = {
    Name  = "rds-${var.group_name}"
    Group = var.group_name
  }
}
