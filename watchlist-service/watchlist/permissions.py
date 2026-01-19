from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Object-level permission to only allow owners of an object to access it."""

    def has_object_permission(self, request, view, obj):
        # obj.user_id is stored as string
        user_id = getattr(request.user, 'id', None)
        return user_id is not None and str(obj.user_id) == str(user_id)
