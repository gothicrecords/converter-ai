"""
FastAPI Backend Server
Main entry point for the Python backend API
"""
import os
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
    oauth,
    audio,
    video,
)
from backend.middleware.error_handler import error_handler
from backend.middleware.logging_middleware import LoggingMiddleware
from backend.middleware.rate_limit import RateLimitMiddleware
from backend.middleware.security import SecurityMiddleware
try:
    from backend.middleware.tool_monitoring import ToolMonitoringMiddleware
    TOOL_MONITORING_AVAILABLE = True
except ImportError:
    TOOL_MONITORING_AVAILABLE = False

# Get settings after all imports
settings = get_settings()

# Configure logging
from backend.utils.logger import setup_logging, get_logger

# Setup structured logging
log_level = settings.ENVIRONMENT.upper() if settings.ENVIRONMENT == "production" else "INFO"
setup_logging(
    level=log_level,
    json_format=settings.ENVIRONMENT == "production",
    log_file=None  # Can be configured via env var
)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    # Startup
    logger.info("Starting FastAPI server...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Start job queue if available
    try:
        from backend.utils.queue import get_job_queue
        queue = get_job_queue()
        await queue.start()
        logger.info("Job queue started")
    except ImportError:
        logger.info("Job queue not available")
    
    yield
    
    # Shutdown
    logger.info("Shutting down FastAPI server...")
    
    # Stop job queue if available
    try:
        from backend.utils.queue import get_job_queue
        queue = get_job_queue()
        await queue.stop()
        logger.info("Job queue stopped")
    except ImportError:
        pass


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

# Custom middleware (order matters - security first, then rate limiting, then monitoring, then logging)
app.add_middleware(SecurityMiddleware)
app.add_middleware(
    RateLimitMiddleware,
    default_limit=100,  # requests per window
    window_seconds=60,  # 1 minute window
)
if TOOL_MONITORING_AVAILABLE:
    app.add_middleware(ToolMonitoringMiddleware)
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
app.include_router(oauth.router, prefix="/api/auth/oauth", tags=["oauth"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(stripe.router, prefix="/api/stripe", tags=["stripe"])
app.include_router(support.router, prefix="/api/support", tags=["support"])
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(video.router, prefix="/api/video", tags=["video"])


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
    
    # legge la porta da variabile d'ambiente PORT, se non c'è usa 8000 di default
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(app, host="0.0.0.0", port=port)
