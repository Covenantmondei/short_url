from django.db import models

class ShortUrl(models.Model):
    original_url = models.URLField()
    short_code = models.CharField(max_length=10, unique=True)
    clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.short_code} -> {self.original_url}"