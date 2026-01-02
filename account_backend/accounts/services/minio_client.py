from minio import Minio
from datetime import timedelta
from django.conf import settings


minio_client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure = False
)

def generate_presigned_upload_url(bucket_name, object_name):
    url = minio_client.presigned_put_object(
        bucket_name,
        object_name,
        expires = timedelta(minutes=5)
    )

    return url