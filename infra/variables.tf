variable aws_region {
    default = "us-east-1"
}

data "http" "my_ip" {
  url = "https://ifconfig.me/ip"
}