# views.py
import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .service import verify_better_auth_password
from .models import Account, User
from .serializers import ChangePasswordSerializer, ChangePasswordSerializer, UserUpdateSerializer
from django.contrib.auth.hashers import check_password, make_password

class UpdateUserProfileView(APIView):
    def put(self, request, user_id):
        # DEBUG: Print this to your console to see if data is actually arriving
        print(f"Request Data: {request.data}") 
        
        user = get_object_or_404(User, id=user_id)

        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Refresh from DB to ensure we are seeing the latest state
            user.refresh_from_db() 
            return Response(UserUpdateSerializer(user).data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ChangePasswordView(APIView):
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        account = get_object_or_404(Account, user_id=user_id)

        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Use the custom verify function instead of check_password
        current_password = serializer.validated_data['current_password']
        if not verify_better_auth_password(current_password, account.password):
            return Response({"current_password": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        # To SAVE the new password in the SAME format (so Better Auth can read it):
        import os
        new_salt = os.urandom(16) # 16 bytes = 32 hex chars
        new_hash = hashlib.scrypt(
            serializer.validated_data['new_password'].encode('utf-8'),
            salt=new_salt,
            n=16384,
            r=8,
            p=1,
            dklen=64
        )
        
        # Store back in salt:hash format
        account.password = f"{new_salt.hex()}:{new_hash.hex()}"
        account.save()

        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)