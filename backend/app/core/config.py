from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List

class Settings(BaseSettings):
    DATABASE_URL: str
    
    PROJECT_NAME: str
    VERSION: str
    ALLOW_ORIGINS: List[str] = ["*"]
    
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    AWS_REGION: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    CLOUDWATCH_LOG_GROUP: Optional[str] = None
    CLOUDWATCH_LOG_STREAM: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()