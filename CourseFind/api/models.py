from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class PastQuery(models.Model):
    title = models.CharField(max_length = 128)
    seasonCode = models.CharField(max_length = 4)
    #each integer represents the id of the classes recomended in order
    content = models.CommaSeparatedIntegerField
    created_at = models.DateTimeField(auto_now_add = True)

    #links PastQuerys to a User, on delete means that if the user is deleted, so are the notes
    author = models.ForeignKey(User,on_delete = models.CASCADE, related_name = "past_query")

    def __str__(self):
        return self.title



