#!/usr/bin/env python3
"""
Script per avviare il backend FastAPI
"""
import uvicorn
from backend.config import get_settings

settings = get_settings()

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

