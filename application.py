from flask import Flask, render_template, jsonify, request, abort
import config

from yelp import get_businesses

# from db import Favorite, get_session

application = Flask(__name__)


# Renders UI
@application.route("/")
def home():
    # 💡 renders an html page with url parameters, if any
    # 🆘 1. We need to show the correct homepage! Change start.html to homepage.html
    return render_template("homepage.html", city=request.args.get("city", ""))


# API Endpoints
@application.route("/api/places/<city>") # annotation for route
def places(city):
    businesses = get_businesses(city) # getting list of businesses from Yelp
    return jsonify(businesses) # json rendered array

# ================================================================================
# Code skeleton for favorites. Not covered in this workshop, but a fun next step!
# ================================================================================

@application.route("/api/places/<place_id>/favorites", methods=["POST"])
def create_favorite_event(place_id):
    print("Should save a favorite", place_id)
    return abort(400)
    # user_id = request.headers.get("x-user-id")
    # session = get_session()

    # favorite = (
    #     session.query(Favorite).filter_by(place_id=place_id, user_id=user_id).first()
    # )

    # if favorite:
    #     return abort(400)

    # favorite = Favorite(place_id=place_id, user_id=user_id)

    # session.add(favorite)
    # session.commit()

    # return jsonify(favorite.to_dict())


# @application.route("/api/places/<place_id>/favorites", methods=["DELETE"])
# def delete_favorite_event(place_id):
#     user_id = request.headers.get("x-user-id")
#     session = get_session()

#     favorite = (
#         session.query(Favorite).filter_by(place_id=place_id, user_id=user_id).first()
#     )

#     if favorite:
#         session.delete(favorite)
#         session.commit()

#         return jsonify(favorite.to_dict())

#     abort(404)


@application.route("/api/places/<place_id>/favorites", methods=["GET"])
def get_favorites_event(place_id):
    print("Should get number of favourites for", place_id)
    return jsonify(
        {
            "count": 0,
            "results": [],
        }
    )
    # session = get_session()
    # favorites_query = session.query(Favorite).filter_by(place_id=place_id)

    # return jsonify(
    #     {
    #         "count": favorites_query.count(),
    #         "results": [x.to_dict() for x in favorites_query.all()],
    #     }
    # )


if __name__ == "__main__":
    application.run()
