# serializers.py
from rest_framework import serializers
from .models import User
from .services.minio_client import generate_presigned_download_url


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "email", "image"]

    def validate_email(self, value):
        user_id = self.instance.id
        if User.objects.exclude(id=user_id).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        return value


class UserProfileDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["name", "email", "image", "image", "image_url"]

    def get_image_url(self, obj):
        if obj.image:
            try:
                return generate_presigned_download_url("userasset", obj.image)
            except Exception:
                return "/images/avatar.png"
