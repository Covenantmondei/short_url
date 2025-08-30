from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ShortUrl
from .serializers import ShortUrlSerializer
from .utils import generate_short_code

class Url_shortener(APIView):
    def post(self, request):
        serializer = ShortUrlSerializer(data=request.data)
        if serializer.is_valid():
            short_code = generate_short_code()
            while ShortUrl.objects.filter(short_code=short_code).exists():
                short_code = generate_short_code()
            serializer.save(short_code=short_code)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    

class GetUrls(APIView):
    def get(self, request):
        url = ShortUrl.objects.all()
        serializer = ShortUrlSerializer(url, many=True)
        return Response(serializer.data)
    

@api_view(['GET'])
def redirect_url(request, short_code):
    try:
        url = ShortUrl.objects.get(short_code=short_code)
        url.clicks += 1
        url.save()
        return Response({'original_url': url.original_url})
    except ShortUrl.DoesNotExist:
        return Response({'error': 'URL not found'}, status=404)