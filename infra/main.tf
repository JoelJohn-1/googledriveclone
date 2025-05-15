terraform {
  required_version = ">= 1.11.4"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "documents" {
  bucket = "jj-google-drive-document-bucket"
}

resource "aws_db_instance" "users" {
  allocated_storage           = 10
  db_name                     = "users"
  engine                      = "mysql"
  engine_version              = "8.4.5"
  instance_class              = "db.t4g.micro"
  username                    = "admin"
  manage_master_user_password = true
  skip_final_snapshot         = true
  publicly_accessible         = true
}

resource "aws_vpc_security_group_ingress_rule" "allow_mysql_from_your_ip" {
  security_group_id = tolist(aws_db_instance.users.vpc_security_group_ids)[0]
  from_port         = 3306
  to_port           = 3306
  ip_protocol       = "tcp"
  cidr_ipv4         = "${chomp(data.http.my_ip.response_body)}/32"
  description       = "Allow MySQL access from my IP"

}
