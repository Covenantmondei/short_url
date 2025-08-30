from .views import *
from django.urls import path

urlpatterns = [
    path('short', Url_shortener.as_view(), name='shorten-url'),
    path('urls', GetUrls.as_view(), name='get-urls'),
    path('<str:short_code>', redirect_url, name='redirect-url'),
]