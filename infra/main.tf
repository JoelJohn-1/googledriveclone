terraform {
  required_version = ">= 1.11.4"
}

provider "aws" {
  region = var.aws_region
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
resource "aws_key_pair" "ec2_key" {
  key_name   = "mongo-key"
  public_key = file("~/.ssh/id_rsa.pub")  # Replace with your public SSH key path
}
resource "aws_security_group" "mongo_sg" {
  name        = "mongo-sg"
  description = "Allow SSH and MongoDB access"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.my_ip.response_body)}/32"]
  }

  ingress {
    description = "MongoDB"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["${chomp(data.http.my_ip.response_body)}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_instance" "mongo_instance" {
  ami                         = "ami-0953476d60561c955"
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.ec2_key.key_name
  vpc_security_group_ids      = [aws_security_group.mongo_sg.id]
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install docker -y
              service docker start
              usermod -a -G docker ec2-user
              docker run -d -p 27017:27017 --name mongodb mongo
              EOF
  tags = {
    Name = "MongoDB-Instance"
  }
}
