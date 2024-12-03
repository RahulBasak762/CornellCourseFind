from django.shortcuts import render
from django.http import HttpResponse

from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, PastQuerySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import  PastQuery

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework import status

from Searcher.Querier import querier
from Searcher import *

# Create your views here.


class currentChat(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get('query')
        
        # Your query processing logic here
        processed_result = self.process_query(query)
        
        return Response({
            'result': processed_result,
            'query': query
        })
    
    def process_query(self, query):
        # Implement your query analysis logic here
        # Return the processed result
        #pass
        return querier("SP25", query)
    
class LogoutView(APIView):
    def post(self, request):
        try:
            #TODO
            refresh_token = request.data.get('refreshToken')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        


class CreateUserView(generics.CreateAPIView):
    #query to ensure user does not already exist
    queryset = User.objects.all()
    serializer_class = UserSerializer
    #let anyone try and make a new user
    permission_classes = [AllowAny]

class PastQuerysListCreate(generics.ListCreateAPIView):
    serializer_class = PastQuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return PastQuery.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author = self.request.user)
        else:
            print(serializer.errors)

class DeletePastQuery(generics.DestroyAPIView):
    serializer_class = PastQuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return PastQuery.objects.filter(author=user)
    





