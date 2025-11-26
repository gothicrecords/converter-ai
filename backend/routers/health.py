"""
Health check router - Endpoint avanzati per monitoraggio 24/7
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import logging
import time
from datetime import datetime

from backend.utils.database import db_pool
from backend.utils.cache import cache
from backend.config import get_settings
from backend.services.monitoring_service import get_monitor

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health():
    """Basic health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "message": "API is running",
        "timestamp": datetime.utcnow().isoformat(),
    })


@router.get("/health/detailed")
async def health_detailed():
    """Detailed health check with component status and system metrics"""
    start_time = time.time()
    
    monitor = get_monitor()
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "components": {},
        "system": {},
    }
    
    try:
        # Check database
        db_healthy = db_pool.health_check()
        health_status["components"]["database"] = {
            "status": "healthy" if db_healthy else "unhealthy",
            "configured": db_pool._pool is not None,
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["components"]["database"] = {
            "status": "error",
            "error": str(e),
        }
    
    try:
        # Check cache
        cache_stats = cache.get_stats()
        health_status["components"]["cache"] = {
            "status": "healthy",
            "size": cache_stats.get("size", 0),
        }
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        health_status["components"]["cache"] = {
            "status": "error",
            "error": str(e),
        }
    
    # Get system metrics
    try:
        system_metrics = monitor.get_system_metrics()
        health_status["system"] = system_metrics
    except Exception as e:
        logger.error(f"System metrics failed: {e}")
        health_status["system"] = {"error": str(e)}
    
    # Overall status
    all_healthy = all(
        comp.get("status") == "healthy"
        for comp in health_status["components"].values()
    )
    
    if not all_healthy:
        health_status["status"] = "degraded"
    
    health_status["response_time_ms"] = int((time.time() - start_time) * 1000)
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(health_status, status_code=status_code)


@router.get("/health/ready")
async def readiness():
    """Readiness probe - checks if service is ready to accept traffic"""
    # Check critical dependencies
    db_ready = db_pool.health_check()
    
    if not db_ready:
        return JSONResponse({
            "status": "not_ready",
            "message": "Database not available",
        }, status_code=503)
    
    return JSONResponse({
        "status": "ready",
        "message": "Service is ready",
    })


@router.get("/health/live")
async def liveness():
    """Liveness probe - checks if service is alive"""
    return JSONResponse({
        "status": "alive",
        "message": "Service is alive",
        "timestamp": datetime.utcnow().isoformat(),
    })


@router.get("/health/metrics")
async def metrics():
    """Endpoint per metriche di sistema (per monitoring esterno)"""
    try:
        monitor = get_monitor()
        metrics = monitor.get_system_metrics()
        return JSONResponse(metrics)
    except Exception as e:
        logger.error(f"Errore nel recupero metriche: {e}", exc_info=True)
        return JSONResponse({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }, status_code=500)

