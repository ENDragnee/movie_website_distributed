# serializers.py
from rest_framework import serializers
from .models import User

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "email", "image"]

    def validate_email(self, value):
        user_id = self.instance.id
        if User.objects.exclude(id=user_id).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        return value

