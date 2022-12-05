"""donkey_ears URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from . import views

from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('', include('frontEnd.urls')),
    path('content/get/<int:content_id>', include('frontEnd.urls')),
    path('content_with_vote/get/<int:content_id>', include('frontEnd.urls')),
    path('test/web3_storage1', include('frontEnd.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('donkey_ears/crypto_keys_test', views.crypto_keys_test),
    path('donkey_ears/crypto_keys_test2', views.crypto_keys_test2),
    path('donkey_ears/web3_transaction_test', views.web3_transaction_test)
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


