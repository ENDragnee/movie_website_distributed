# views.py
import uuid
from .models import User
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserUpdateSerializer, UserProfileDetailSerializer
from django.shortcuts import get_object_or_404
from .services.minio_client import generate_presigned_upload_url


class UserProfileDetailView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        try:
            serializer = UserProfileDetailSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(f"Error fetching user detail, {e}")


class ImageUploadIntentView(APIView):
    def post(self, request):
        file_name = request.data.get("file_name")
        print("file_name", file_name)
        extention = file_name.split(".")[-1]

        object_name = f"images/{uuid.uuid4()}.{extention}"
        url = generate_presigned_upload_url("userasset", object_name)

        print("here is the url", url)

        return Response({"uploadUrl": url, "minioKey": object_name})


class UpdateUserProfileView(APIView):
    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Refresh from DB to ensure we are seeing the latest state
            user.refresh_from_db()
            return Response(UserUpdateSerializer(user).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
