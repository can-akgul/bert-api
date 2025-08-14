from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"


class NewsHistory(Base):
    __tablename__ = "news_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)  # Foreign key to users
    news_text = Column(Text, nullable=False)
    custom_prediction = Column(String(10), nullable=False)  # "fake" or "true"
    gemini_prediction = Column(String(10), nullable=False)  # "fake" or "true"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<NewsHistory(id={self.id}, user_id={self.user_id}, custom_prediction='{self.custom_prediction}')>"


class GeneratedNews(Base):
    __tablename__ = "generated_news"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)  # Foreign key to users
    context = Column(String(50), nullable=False)
    style = Column(String(50), nullable=False)
    length = Column(String(50), nullable=False)
    additional_context = Column(Text)
    generated_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<GeneratedNews(id={self.id}, user_id={self.user_id}, context='{self.context}')>" 