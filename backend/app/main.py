"""
Guardian API - Main FastAPI application
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import moderate, health
from app.models.sexism_classifier import sexism_classifier
from app.models.toxicity_model import toxicity_model
from app.models.rule_engine import rule_engine
from app.core.rate_limit import init_redis

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    logger.info("Starting Guardian API...")
    
    # Initialize rate limiting
    init_redis()
    
    # Load models
    logger.info("Loading models...")
    
    # Load sexism classifier
    sexism_loaded = sexism_classifier.load_model()
    if sexism_loaded:
        logger.info("✓ Sexism classifier loaded")
    else:
        logger.warning("✗ Sexism classifier failed to load")
    
    # Load toxicity model
    toxicity_loaded = toxicity_model.load_model()
    if toxicity_loaded:
        logger.info("✓ Toxicity model loaded")
    else:
        logger.warning("✗ Toxicity model failed to load (may need HuggingFace model)")
    
    # Load rule engine
    rules_loaded = rule_engine.load_rules()
    if rules_loaded:
        logger.info("✓ Rule engine loaded")
    else:
        logger.warning("✗ Rule engine failed to load")
    
    logger.info("Guardian API ready")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Guardian API...")


# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Use computed property to get list from string
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(moderate.router)
app.include_router(health.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Guardian API",
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs"
    }

