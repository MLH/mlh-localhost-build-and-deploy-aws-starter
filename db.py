from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, BigInteger

import config

database = create_engine(config.DATABASE_URL)
base = declarative_base()


class Favorite(base):
    __tablename__ = "favorites"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, index=True)
    event_id = Column(BigInteger, index=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


base.metadata.create_all(database)
Session = sessionmaker(database)


def get_session():
    return Session()
