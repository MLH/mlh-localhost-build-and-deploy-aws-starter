from flask import Flask, render_template, jsonify, request, abort
import config

from eventbrite import get_events

from db import Favorite, get_session, database

application = Flask(__name__)


# Renders UI
@application.route("/")
def home():
    # 💡 renders an html page with url parameters, if any
    # 🆘 1. We need to show the correct homepage! Change start.html to homepage.html
    return render_template("start.html", city=request.args.get("city", ""))


# API Endpoints
@application.route("/api/events/<city>") # annotation for route
def events(city): # function name
    events = get_events(city) # getting list of events from eventbrite 
    return jsonify(events) # json rendered array


@application.route("/api/events/<event_id>/favorites", methods=["POST"])
def create_favorite_event(event_id):
    user_id = request.headers.get("x-user-id")
    session = get_session()

    favorite = (
        session.query(Favorite).filter_by(event_id=event_id, user_id=user_id).first()
    )

    if favorite:
        return abort(400)

    favorite = Favorite(event_id=event_id, user_id=user_id)

    session.add(favorite)
    session.commit()

    return jsonify(favorite.to_dict())


@application.route("/api/events/<event_id>/favorites", methods=["DELETE"])
def delete_favorite_event(event_id):
    user_id = request.headers.get("x-user-id")
    session = get_session()

    favorite = (
        session.query(Favorite).filter_by(event_id=event_id, user_id=user_id).first()
    )

    if favorite:
        session.delete(favorite)
        session.commit()

        return jsonify(favorite.to_dict())

    abort(404)


@application.route("/api/events/<event_id>/favorites", methods=["GET"])
def get_favorites_event(event_id):
    session = get_session()
    favorites_query = session.query(Favorite).filter_by(event_id=event_id)

    return jsonify(
        {
            "count": favorites_query.count(),
            "results": [x.to_dict() for x in favorites_query.all()],
        }
    )


if __name__ == "__main__":
    application.run()

