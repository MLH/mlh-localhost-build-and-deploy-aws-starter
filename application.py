from flask import Flask, render_template, jsonify, request, abort
import config

from sqlalchemy import create_engine
from sqlalchemy import Column, String, BigInteger, ForeignKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from eventbrite import get_events

application = Flask(__name__)


db_string = (
    "postgresql://"
    + config.DATABASE_USERNAME
    + ":"
    + config.DATABASE_PASSWORD
    + "@"
    + config.DATABASE_SERVER
    + ":"
    + config.DATABASE_PORT
    + "/"
    + config.DATABASE_NAME
)
db = create_engine(db_string)
base = declarative_base()


class Favorite(base):
    __tablename__ = "favorites"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, index=True)
    event_id = Column(BigInteger, index=True)
    ForeignKeyConstraint(
        ["user_id", "event_id"], ["favorites.user_id", "favorites.event_id"]
    )

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


Session = sessionmaker(db)
session = Session()

base.metadata.create_all(db)


# Renders UI
@application.route("/")
def home():
    return render_template("homepage.html", city=request.args.get("city", ""))


@application.route("/api/events/<city>")
def events(city):
    events = get_events(city)
    return jsonify(events)


@application.route("/api/events/<event_id>/favorites", methods=["POST"])
def create_favorite_event(event_id):
    user_id = request.headers.get("x-user-id")

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
    favorites_query = session.query(Favorite).filter_by(event_id=event_id)

    return jsonify(
        {
            "count": favorites_query.count(),
            "results": [x.to_dict() for x in favorites_query.all()],
        }
    )


@application.teardown_request
def teardown_request(exception):
    if exception:
        db.session.rollback()
    db.session.remove()


if __name__ == "__main__":
    application.run()

