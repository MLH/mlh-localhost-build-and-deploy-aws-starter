import config # 💡importing our env variables from dotenv
from urllib.request import Request, urlopen # 💡open a web url 
from urllib.parse import quote # 💡get rid of any weird characters in our city string
import json # 💡json stands for Javascript Object Notation and is commonly used to transmit web data

###
# 🆘 Help us fix this file!! 🆘
###

# 1. 🆘✨ we want to get events for the city name a user types in. Replace the placeholder variable with city 🏙 as a parameter!
def get_events( FIX_ME ):

    # 2. 🆘✨ use the dotenv file to find the correct variable for Eventbrite!
    # We need to use our key! Look in the .env file for the Eventbrite key name
    headers = { "Authorization": "Bearer " + config.FIX_ME }

    # 💡the Request() method calls an external URL from our Python server
    request = Request(
        "https://www.eventbriteapi.com/v3/events/search/?location.address="
        + quote(city),  # 💡escape url param
        headers=headers, # 💡headers are variables passed DIRECTLY to the server
    )
    response_body = urlopen(request).read()

    # 3. 🆘✨we want to get a JSON response from Eventbrite. 
    # They keep the info we need in the response_body.events. Help us get the data we want!
    events = json.loads(response_body)["FIX_ME"]

    # 💡returns a JSON array of events in a city
    return events
