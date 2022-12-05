
from rest_framework import pagination


# function based view pagination 
#  ref) https://stackoverflow.com/a/43493743

class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 15
    page_query_param = 'page'
    page_size_query_param = 'per_page'
    max_page_size = 1000