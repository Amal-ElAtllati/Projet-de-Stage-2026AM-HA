from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./newsletters.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Newsletter(Base):
    __tablename__ = "newsletters"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200))
    subject     = Column(String(100))
    language    = Column(String(10))
    style       = Column(String(100))
    content     = Column(Text)
    created_at  = Column(DateTime, default=datetime.now)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()