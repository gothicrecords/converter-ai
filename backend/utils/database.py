"""
Database connection pool management
Provides optimized connection pooling for PostgreSQL/Neon
"""
import logging
from typing import Optional
from contextlib import contextmanager
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Try to import psycopg2
try:
    import psycopg2
    from psycopg2 import pool
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logger.warning("psycopg2 not available - database features will be limited")


class DatabasePool:
    """
    Singleton database connection pool manager
    Provides optimized connection pooling with health checks
    """
    
    _instance: Optional['DatabasePool'] = None
    _pool: Optional[pool.SimpleConnectionPool] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize connection pool"""
        if self._pool is None:
            self._initialize_pool()
    
    def _initialize_pool(self):
        """Initialize the connection pool"""
        if not PSYCOPG2_AVAILABLE:
            logger.warning("psycopg2 not available - database pool not initialized")
            return
        
        db_url = settings.NEON_DATABASE_URL or settings.DATABASE_URL
        if not db_url:
            logger.warning("Database URL not configured - database pool not initialized")
            return
        
        try:
            # Connection pool configuration
            # minconn: minimum connections to keep open
            # maxconn: maximum connections in the pool
            self._pool = pool.SimpleConnectionPool(
                minconn=1,
                maxconn=10,  # Adjust based on your needs
                dsn=db_url,
                # Connection parameters for better performance
                connect_timeout=10,
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5,
            )
            
            # Test connection
            test_conn = self._pool.getconn()
            test_conn.close()
            self._pool.putconn(test_conn)
            
            logger.info("Database connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}", exc_info=True)
            self._pool = None
    
    def get_connection(self):
        """Get a connection from the pool"""
        if not self._pool:
            raise ValueError("Database pool not initialized")
        
        try:
            return self._pool.getconn()
        except Exception as e:
            logger.error(f"Failed to get database connection: {e}", exc_info=True)
            raise
    
    def return_connection(self, conn):
        """Return a connection to the pool"""
        if self._pool and conn:
            try:
                self._pool.putconn(conn)
            except Exception as e:
                logger.error(f"Error returning connection to pool: {e}", exc_info=True)
    
    @contextmanager
    def get_cursor(self, dict_cursor: bool = False):
        """
        Context manager for database operations
        Automatically handles connection and cursor lifecycle
        """
        conn = None
        try:
            conn = self.get_connection()
            cursor_class = RealDictCursor if dict_cursor else None
            cursor = conn.cursor(cursor_factory=cursor_class)
            yield cursor
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database operation failed: {e}", exc_info=True)
            raise
        finally:
            if conn:
                cursor.close()
                self.return_connection(conn)
    
    def health_check(self) -> bool:
        """Check if database pool is healthy"""
        if not self._pool:
            return False
        
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            self.return_connection(conn)
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}", exc_info=True)
            return False
    
    def close_all(self):
        """Close all connections in the pool"""
        if self._pool:
            self._pool.closeall()
            self._pool = None
            logger.info("Database connection pool closed")


# Global database pool instance
db_pool = DatabasePool()

