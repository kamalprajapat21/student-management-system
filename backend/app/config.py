from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Student Management System"
    app_version: str = "1.0.0"
    debug: bool = True
    secret_key: str = "supersecretkey-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "student_management"

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    openai_api_key: str = ""

    upload_dir: str = "uploads"
    max_file_size: int = 10485760

    frontend_url: str = "http://localhost:3000"
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
