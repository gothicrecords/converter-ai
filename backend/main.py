"""
FastAPI Backend Server
Main entry point for the Python backend API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
from contextlib import asynccontextmanager

from backend.config import get_settings
from backend.routers import (
    convert,
    pdf,
    tools,
    upscale,
    auth,
    files,
    chat,
    users,
    stripe,
    support,
    health,
)
from backend.middleware.error_handler import error_handler
from backend.middleware.logging_middleware import LoggingMiddleware

# Get settings after all imports
settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    # Startup
    logger.info("Starting FastAPI server...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    yield
    # Shutdown
    logger.info("Shutting down FastAPI server...")


# Create FastAPI app
app = FastAPI(
    title="MegaPixelAI API",
    description="AI-powered file conversion and processing API",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware
# Handle CORS origins - if "*" is set, don't use allow_credentials (not compatible)
cors_origins = settings.CORS_ORIGINS
if cors_origins == "*" or (isinstance(cors_origins, list) and "*" in cors_origins):
    # Allow all origins without credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Cannot use credentials with "*"
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Use specific origins with credentials
    origins_list = cors_origins if isinstance(cors_origins, list) else [cors_origins]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

# Custom middleware
app.add_middleware(LoggingMiddleware)

# Exception handlers
app.add_exception_handler(StarletteHTTPException, error_handler)
app.add_exception_handler(RequestValidationError, error_handler)
app.add_exception_handler(Exception, error_handler)

# Include routers
app.include_router(convert.router, prefix="/api/convert", tags=["convert"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])
app.include_router(upscale.router, prefix="/api", tags=["upscale"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(stripe.router, prefix="/api/stripe", tags=["stripe"])
app.include_router(support.router, prefix="/api/support", tags=["support"])
app.include_router(health.router, prefix="/api", tags=["health"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "MegaPixelAI API",
        "version": "2.0.0",
        "status": "online"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    import os
    # Railway sets PORT automatically, use it if available
    port = int(os.getenv("PORT", settings.PORT))
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=port,
        reload=settings.DEBUG,
        log_level="info"
    )

