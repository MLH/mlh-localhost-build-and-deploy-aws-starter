import os
from dotenv import load_dotenv

load_dotenv()

FLASK_APP_SECRET_KEY = os.getenv("FLASK_APP_SECRET_KEY")
EVENTBRITE_AUTH_TOKEN = os.getenv("EVENTBRITE_AUTH_TOKEN")

# Reads the database config injected by AWS Elastic Beanstalk
if "RDS_DB_NAME" in os.environ:
    # AWS Elastic Beanstalk doesn't set an RDS_ENGINE by default,
    # so we set this to fallback to mysql, and allow for overriding if needed
    rds_db_string = (
        os.getenv("RDS_ENGINE", "mysql")
        + "://"
        + os.getenv("RDS_USERNAME")
        + ":"
        + os.getenv("RDS_PASSWORD")
        + "@"
        + os.getenv("RDS_HOSTNAME")
        + ":"
        + os.getenv("RDS_PORT")
        + "/"
        + os.getenv("RDS_DB_NAME")
    )
    DATABASE_URL = rds_db_string
else:
    DATABASE_URL = os.getenv("DATABASE_URL")
