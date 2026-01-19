from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class User(AbstractBaseUser):
    id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    emailVerified = models.BooleanField(default=False, db_column="emailVerified")
    image = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=50, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True, db_column="createdAt")
    updatedAt = models.DateTimeField(auto_now=True, db_column="updatedAt")

    # Django specific requirements
    password = None  # We override this because password is in Account table
    last_login = None
    USERNAME_FIELD = "email"

    class Meta:
        db_table = "user"  # Matches @@map("user")
        managed = False
