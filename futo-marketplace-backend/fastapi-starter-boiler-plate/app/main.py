from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import router as api_router

app = FastAPI(
    title="FUTO Marketplace API",
    description="Backend API for FUTO Marketplace — Federal University of Technology Owerri",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — only allow our frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routes under /api/v1
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "success": True,
        "message": "FUTO Marketplace API is running",
        "docs": "/docs"
    }