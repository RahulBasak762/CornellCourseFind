from django.urls import path
from . import views

urlpatterns = [
    path("PastQueries/", views.PastQuerysListCreate.as_view(), name = "past-queries"),
    path("PastQueries/delete/<int:pk>/>", views.DeletePastQuery.as_view(), name = "delete-past-query")

]
