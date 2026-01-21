from rest_framework import viewsets
from .models import Watchlist
from .serializers import WatchlistSerializer
from .permissions import IsOwner


class WatchlistViewSet(viewsets.ModelViewSet):
    """Provides POST / GET list / PUT / DELETE for watchlist entries.

    All operations are automatically scoped to the authenticated user via
    `get_queryset` and `perform_create`.
    """

    serializer_class = WatchlistSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        user_id = getattr(self.request.user, "id", None)
        if not user_id:
            return Watchlist.objects.none()
        return Watchlist.objects.filter(user_id=str(user_id)).order_by("-created_at")

    def perform_create(self, serializer):
        user_id = getattr(self.request.user, "id", None)
        serializer.save(user_id=str(user_id))

    def retrieve(self, request, *args, **kwargs):
        # Standard retrieve still enforces object permissions via IsOwner
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Allow updating the status (and other safe fields), but ensure user can't change owner
        if "user_id" in request.data:
            request.data.pop("user_id")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
