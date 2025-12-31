# urls.py
from django.urls import path
from .views import ChangePasswordView, UpdateUserProfileView

urlpatterns = [
    path("profile/<str:user_id>/", UpdateUserProfileView.as_view()),
    path("change-password/<str:user_id>/", ChangePasswordView.as_view()),
]
