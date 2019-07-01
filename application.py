from flask import Flask, render_template, jsonify
import config

from eventbrite import get_events

application = Flask(__name__)

# Renders UI
@application.route("/")
def home():
    return render_template("homepage.html")


@application.route("/api/events/<city>")
def events(city):
    events = get_events(city)
    return jsonify(events)


if __name__ == "__main__":
    application.run()
