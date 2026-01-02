# urls.py
from django.urls import path
from .views import ImageUploadIntentView, UpdateUserProfileView

urlpatterns = [
    path("<str:user_id>/profile/", UpdateUserProfileView.as_view()),
    path("upload_image/", ImageUploadIntentView.as_view())
]
