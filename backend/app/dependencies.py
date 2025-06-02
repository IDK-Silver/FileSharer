# backend/app/dependencies.py
from functools import lru_cache
from fastapi import HTTPException, status

from app.services.storage_interface import StorageInterface
from app.services.s3_service import S3Service # Initially S3
from app.core.config import settings

@lru_cache() # Cache the service instance for performance
def get_storage_service() -> StorageInterface:
    # This is where you could switch between S3 and MinIO based on settings.STORAGE_TYPE
    # For now, we directly instantiate S3Service.
    if not settings.S3_BUCKET_NAME or \
       not settings.AWS_REGION or \
       not settings.AWS_ACCESS_KEY_ID or \
       not settings.AWS_SECRET_ACCESS_KEY:
        # AWS_SESSION_TOKEN is optional for non-Academy, but required for Academy
        if settings.AWS_SESSION_TOKEN is None and "academy" in settings.PROJECT_NAME.lower(): # Heuristic
             raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="S3 configuration incomplete: AWS_SESSION_TOKEN missing for Academy setup."
            )
        # For general S3 setup
        # elif settings.AWS_SESSION_TOKEN is not None: # This condition is now handled by Boto3 if token is None
        #     pass # Boto3 will ignore None session token

        # Check for essential S3 credentials if not using IAM roles (which Academy might bypass with temp creds)
        # This check is a bit broad as IAM roles are preferred.
        # But for explicit key setup, these are needed.
        # For AWS Academy, these are provided temporarily.
        # The S3Service __init__ will raise NoCredentialsError if boto3 can't find them.
        pass # Rely on S3Service __init__ to raise specific errors if config is bad.


    # print(f"Initializing storage service with S3_BUCKET_NAME: {settings.S3_BUCKET_NAME}") # For debugging
    try:
        service = S3Service()
        return service
    except Exception as e: # Catch init errors from S3Service
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Storage service (S3) could not be initialized: {str(e)}"
        )