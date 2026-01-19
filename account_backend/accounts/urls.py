# urls.py
from django.urls import path
from .views import ImageUploadIntentView, UpdateUserProfileView, UserProfileDetailView

urlpatterns = [
    path("<str:user_id>/profile/", UserProfileDetailView.as_view()),
    path("<str:user_id>/update_profile/", UpdateUserProfileView.as_view()),
    path("upload_image/", ImageUploadIntentView.as_view())
]
