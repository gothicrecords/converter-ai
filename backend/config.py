"""
Configuration settings for the backend
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "MegaPixelAI"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))  # Railway sets PORT env var automatically
    
    # CORS - Support both string and list formats
    # Can be "*" for all origins, or comma-separated string, or list
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")  # Allow all origins by default
    
    # Database - Neon (PostgreSQL)
    NEON_DATABASE_URL: str = ""
    DATABASE_URL: str = ""  # Alias for NEON_DATABASE_URL
    
    # OpenAI (for AI tools)
    OPENAI_API_KEY: str = ""
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # App URL - Frontend URL (for OAuth redirects, etc.)
    APP_URL: str = os.getenv("APP_URL", "http://localhost:3000")
    
    # File Upload
    MAX_FILE_SIZE: int = 500 * 1024 * 1024  # 500MB
    TEMP_DIR: str = "/tmp"
    UPLOAD_DIR: str = "/tmp/uploads"
    
    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",  # Ignore extra environment variables not defined in model
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

