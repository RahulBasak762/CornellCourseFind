from django.contrib.auth.models import User
from rest_framework import serializers
from .models import PastQuery

#translates between JSON and python

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class PastQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = PastQuery
        fields = ['id', 'title', 'seasonCode', 'content', 'created_at', 'author']
        #don't want to be able to change who owns the past query, only be able to read it
        extra_kwargs = {'author': {'read_only': True}}

