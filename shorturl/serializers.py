from rest_framework import serializers
from .models import ShortUrl

class ShortUrlSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortUrl
        fields = ['id', 'original_url', 'short_code', 'clicks', 'created_at']
        read_only_fields = ['short_code', 'clicks', 'created_at']