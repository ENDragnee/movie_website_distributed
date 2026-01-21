import uuid
from django.db import models


class Watchlist(models.Model):
    class MediaType(models.TextChoices):
        ANIME = "anime"
        MOVIE = "movie"

    class Status(models.TextChoices):
        WATCHING = "watching"
        COMPLETED = "completed"
        PLANNED = "planned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=255, db_index=True)
    media_id = models.CharField(max_length=255)
    media_type = models.CharField(max_length=20, choices=MediaType.choices)
    title = models.CharField(max_length=512)
    poster_url = models.URLField(blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PLANNED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user_id} - {self.title} ({self.media_id})"
