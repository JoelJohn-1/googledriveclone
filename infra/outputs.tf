data "aws_secretsmanager_secret_version" "secret_arn" {
  secret_id = aws_db_instance.users.master_user_secret[0].secret_arn
}

locals {
  secret_data     = jsondecode(data.aws_secretsmanager_secret_version.secret_arn.secret_string)
  user_db_address = aws_db_instance.users.address
  user_db_name    = aws_db_instance.users.db_name
  mongo_db_ip     = aws_instance.mongo_instance.public_ip
  jwt_secret_value = random_password.jwt_secret.result
  backend_s3_access_name = aws_secretsmanager_secret.backend_s3_access_secret.name
  region = var.aws_region
  formatted_output = jsonencode({
    development = {
      username = local.secret_data["username"]
      password = local.secret_data["password"]
      database = local.user_db_name
      host     = local.user_db_address
      dialect  = "mysql"
    },
    mongo = {
        mongo_db_ip = local.mongo_db_ip
    },
    jwt = local.jwt_secret_value,
    aws = {
      aws_region = local.region
      backend_secret_identifer = local.backend_s3_access_name
    }
  })
}

resource "local_file" "db_credentials" {
  filename = "${path.module}/../backend/config/config.json"
  content  = local.formatted_output
}
