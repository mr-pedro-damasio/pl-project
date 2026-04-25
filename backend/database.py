from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./prelegal.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    import models  # noqa: F401 — registers models with Base
    from auth import hash_password

    Base.metadata.create_all(bind=engine)

    from models import User

    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "user").first():
            db.add(User(username="user", hashed_password=hash_password("password")))
            db.commit()
    finally:
        db.close()
