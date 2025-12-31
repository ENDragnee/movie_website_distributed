# views.py
import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

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
    
