from sqlalchemy import Column, BigInteger
from sqlalchemy.ext.declarative import declarative_base

from db import base


class Favorite(base):
    __tablename__ = "favorites"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, index=True)
    event_id = Column(BigInteger, index=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
