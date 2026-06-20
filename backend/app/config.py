from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Student Management System"
    app_version: str = "1.0.0"
    debug: bool = True

    # Security
    secret_key: str = "supersecretkey-change-in-production-min32chars!!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # MySQL Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "student_management"

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )

    # Email (SMTP)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    # Gemini AI
    gemini_api_key: str = ""

    # File Upload
    upload_dir: str = "uploads"
    max_file_size: int = 10485760  # 10 MB

    # Frontend URL (CORS)
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()

