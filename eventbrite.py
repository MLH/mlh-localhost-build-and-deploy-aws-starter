import config
from urllib.request import Request, urlopen
from urllib.parse import quote
import json


def get_events(city):
    headers = {"Authorization": "Bearer " + config.EVENTBRITE_AUTH_TOKEN}

    request = Request(
        "https://www.eventbriteapi.com/v3/events/search/?location.address="
        + quote(city),  # escape url param
        headers=headers,
    )
    response_body = urlopen(request).read()
    events = json.loads(response_body)["events"]

    return events
