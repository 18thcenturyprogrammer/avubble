from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

from api.views import get_metacomment_list_view,get_metacomment_list_by_upVote_view, get_metacomment_view, create_metacomment_view, delete_metacomment_view, update_metacomment_view
from api.views import get_user_list_view, get_user_view, create_user_view, delete_user_view, update_user_view
from api.views import do_vote_view
from api.views import do_vote_content_view
from api.views import create_content_view,get_content_list_by_user_recent_view,get_content_view,get_content_with_vote_view,update_content_as_minted_view
from api.views import create_nft_view

# ref) https://youtu.be/xsQRMZxpg9I?t=1303
# 
# defaultrouter doc 
# ref) https://www.django-rest-framework.org/api-guide/routers/#defaultrouter
router = DefaultRouter()
# router.register('path',views.Pathapi)
# router.register('price',views.Priceapi)


app_name = 'api'

urlpatterns = [
    path('get_metacomment_list/', get_metacomment_list_view, name ='get_metacomment_list'),
    path('get_metacomment_list_by_upVote_view/', get_metacomment_list_by_upVote_view, name ='get_metacomment_list_by_upVote_view'),
    path('get_metacomment/<int:metaCommentId>', get_metacomment_view, name ='get_metacomment'),
    path('create_metacomment/', create_metacomment_view, name ='create_metacomment'),
    path('delete_metacomment/<int:metaCommentId>', delete_metacomment_view, name ='delete_metacomment'),
    path('update_metacomment/<int:metaCommentId>', update_metacomment_view, name ='updated_metacomment'),
    path('get_user_list/', get_user_list_view, name ='get_user_list'),
    path('get_user/<int:userId>', get_user_view, name ='get_user'),
    path('create_user/', create_user_view, name ='create_user'),
    path('delete_user/<int:userId>', delete_user_view, name ='delete_user'),
    path('update_user/<int:userId>', update_user_view, name ='updated_user'),
    path('do_vote_view/', do_vote_view, name ='do_vote_view'),
    path('do_vote_content/', do_vote_content_view, name ='do_vote_content_view'),
    path('create_content/', create_content_view, name ='create_content_view'),
    path('get_content_list_by_user_recent/', get_content_list_by_user_recent_view, name ='get_content_list_by_user_recent_view'),
    path('get_content/<int:contentId>', get_content_view, name ='get_content_view'),
    path('get_content_with_vote/<int:contentId>', get_content_with_vote_view, name ='get_content_with_vote_view'),
    path('update_content_as_minted/', update_content_as_minted_view, name ='update_content_as_minted_view'),
    path('create_nft/', create_nft_view, name ='create_nft_view'),


    
    # path('', include(router.urls))
]
