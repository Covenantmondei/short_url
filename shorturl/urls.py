from .views import *
from django.urls import path

urlpatterns = [
    path('short/', ShortUrl.as_view(), name='shorten-url'),
    path('urls/', GetUrls.as_view(), name='get-urls'),
    path('r/<str:short_code>/', redirect_url, name='redirect-url'),
]