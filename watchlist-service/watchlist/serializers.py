from rest_framework import serializers
from .models import Watchlist


class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['id', 'user_id', 'media_id', 'media_type', 'title', 'poster_url', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # user_id will be set in the view's perform_create
        return super().create(validated_data)
