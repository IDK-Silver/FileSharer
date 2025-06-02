# backend/app/services/s3_service.py
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from typing import IO, Optional, Any
import logging

from app.core.config import settings
from .storage_interface import StorageInterface

logger = logging.getLogger(__name__)

class S3Service(StorageInterface):
    def __init__(self):
        try:
            # For AWS Academy, session_token is crucial
            # If not using temporary credentials, aws_session_token can be None
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                aws_session_token=settings.AWS_SESSION_TOKEN, # Pass session token
                region_name=settings.AWS_REGION
            )
            self.bucket_name = settings.S3_BUCKET_NAME
            if not self.bucket_name:
                raise ValueError("S3_BUCKET_NAME is not configured.")
        except NoCredentialsError:
            logger.error("AWS credentials not found. Ensure they are configured.")
            raise
        except Exception as e:
            logger.error(f"Error initializing S3Service: {e}")
            raise


    def upload_file(
        self, file_content: IO[Any], destination_path: str, content_type: Optional[str] = None
    ) -> str:
        extra_args = {"ServerSideEncryption": "AES256"}
        if content_type:
            extra_args["ContentType"] = content_type
        
        if not self.s3_client or not self.bucket_name:
            logger.error("S3 client or bucket name not initialized properly.")
            raise ConnectionError("S3 client not initialized.")

        try:
            self.s3_client.upload_fileobj(
                file_content,
                self.bucket_name,
                destination_path,
                ExtraArgs=extra_args
            )
            logger.info(f"Successfully uploaded to S3: {self.bucket_name}/{destination_path}")
            return destination_path
        except ClientError as e:
            logger.error(f"Failed to upload to S3 ({self.bucket_name}/{destination_path}): {e}")
            # Consider more specific exception handling or re-raising
            raise IOError(f"S3 upload failed: {e}")
        except Exception as e: # Catch other potential errors like uninitialized client
            logger.error(f"An unexpected error occurred during S3 upload: {e}")
            raise

    def delete_file(self, storage_path: str) -> None:
        if not self.s3_client or not self.bucket_name:
            logger.error("S3 client or bucket name not initialized properly.")
            raise ConnectionError("S3 client not initialized.")
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=storage_path)
            logger.info(f"Successfully deleted from S3: {self.bucket_name}/{storage_path}")
        except ClientError as e:
            logger.error(f"Failed to delete {storage_path} from S3: {e}")
            raise IOError(f"S3 delete failed: {e}")

    def generate_presigned_url(
        self, storage_path: str,
        expiration_seconds: int,
        http_method: str = "GET",
        download_filename: Optional[str] = None # 新增參數，用於指定下載時的檔名

    ) -> Optional[str]:
        if not self.s3_client or not self.bucket_name:
            logger.error("S3 client or bucket name not initialized properly.")
            # Depending on desired behavior, could return None or raise error
            return None 
            # raise ConnectionError("S3 client not initialized.")

        # Ensure the http_method is one that generate_presigned_url's ClientMethod expects
        # Common client methods for presigned URLs are 'get_object' and 'put_object'
        client_method_map = {
            "GET": "get_object",
            "PUT": "put_object",
            # Add more if needed, e.g., "DELETE": "delete_object"
        }
        s3_client_method = client_method_map.get(http_method.upper())

        if not s3_client_method:
            logger.error(f"Unsupported http_method '{http_method}' for S3 presigned URL generation.")
            return None


        params = {"Bucket": self.bucket_name, "Key": storage_path}
        
        if http_method.upper() == "GET" and download_filename:
            # 為了確保檔名在 HTTP 標頭中正確編碼，特別是包含非 ASCII 字元時
            # RFC 6266 建議使用 filename*=UTF-8''<urlencoded_filename> 格式
            # 但簡單的 attachment; filename="<filename>" 對很多現代瀏覽器也有效
            # Boto3/S3 通常能處理好檔名的編碼，我們只需提供原始檔名
            params["ResponseContentDisposition"] = f'attachment; filename="{download_filename}"'
            # 如果希望瀏覽器嘗試直接顯示而不是下載 (例如圖片、PDF)，可以使用 'inline'
            # params["ResponseContentDisposition"] = f'inline; filename="{download_filename}"'
        
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod=s3_client_method,
                Params=params,
                ExpiresIn=expiration_seconds,
                HttpMethod=http_method.upper() # Explicitly pass HttpMethod for clarity and correctness
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate S3 presigned URL for {storage_path}: {e}")
            return None
        except Exception as e: # Catch other potential errors
            logger.error(f"An unexpected error occurred generating presigned URL: {e}")
            return None