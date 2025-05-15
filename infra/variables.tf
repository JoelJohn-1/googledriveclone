variable aws_region {
    default = "us-east-1"
}

variable rds_password {
    default = "8f81bcba-0655-45eb-bf0a-ada17b3c2b43"
}

data "http" "my_ip" {
  url = "https://ifconfig.me/ip"
}