from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporarily comment out these router includes until we create the endpoint files
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# app.include_router(files.router, prefix="/api/v1/files", tags=["files"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Cloud File System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}