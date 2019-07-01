import os
from dotenv import load_dotenv

load_dotenv()

FLASK_APP_SECRET_KEY = os.getenv("FLASK_APP_SECRET_KEY")
EVENTBRITE_AUTH_TOKEN= os.getenv("EVENTBRITE_AUTH_TOKEN")
