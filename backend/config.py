"""
Configuration settings for the backend
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "MegaPixelAI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS - Allow all origins in production for Railway deployment
    CORS_ORIGINS: List[str] = ["*"]  # Allow all origins for Railway
    
    # Database - Neon (PostgreSQL)
    NEON_DATABASE_URL: str = ""
    DATABASE_URL: str = ""  # Alias for NEON_DATABASE_URL
    
    # OpenAI (for AI tools)
    OPENAI_API_KEY: str = ""
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    
    # App URL
    APP_URL: str = "http://localhost:3000"
    
    # File Upload
    MAX_FILE_SIZE: int = 500 * 1024 * 1024  # 500MB
    TEMP_DIR: str = "/tmp"
    UPLOAD_DIR: str = "/tmp/uploads"
    
    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables not defined in model


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

