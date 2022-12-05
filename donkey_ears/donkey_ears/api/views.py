import logging
import requests
import json
import datetime

# get secret ref) https://stackoverflow.com/a/61437799
from decouple import config

from web3 import Web3

logger = logging.getLogger("mylogger")

from django.conf import settings
from django.shortcuts import render
from django.core.paginator import Paginator
from django.utils import timezone


from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256

# function view ref) https://jacob-cs.tumblr.com/post/679393731752951808/django-rest-framework-api
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view

from api.models import MetaComment, User, Vote,Content,VoteOnContent,Nft
from api.Serializers import MetaCommentSerializer, ContentSerializer,UserSerializer,VoteSerializer,VoteOnContentSerializer, MetaCommentVoteSerializer, ContentVoteSerializer

from .pagination import StandardResultsSetPagination


@api_view(['GET',])
def get_metacomment_list_view(request):
    data ={}

    try:

        urlAddress = request.GET.get('urlAddress', '')
        metaComments = MetaComment.objects.filter(urlAddress=urlAddress)
        

    except MetaComment.DoesNotExist:
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if metaComments.exists():
            
          
            # function based view pagination 
            #  ref) https://stackoverflow.com/a/43493743
            paginator = StandardResultsSetPagination()
            result_page = paginator.paginate_queryset(metaComments, request)
            serializer = MetaCommentSerializer(result_page, many=True)

            print("serializer.data ",serializer.data)
            print("==================================")
            print(dir(serializer.data))

            return paginator.get_paginated_response(serializer.data)


            # this is what normal returning format, but i decided not to use this because of pagination  
            # data['status'] ='success'
            # data['msg']= 'getting metaComments list success'
            # data['data'] = serializer.data
            
            # return Response(data)

        else:
            return Response(data,status=status.HTTP_404_NOT_FOUND)

    return Response(data,status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET',])
def get_metacomment_list_by_upVote_view(request):
    data ={}

    try:

        try:

            urlAddress = request.GET.get('urlAddress', '')
            userAddress = request.GET.get('userAddress','')

            if urlAddress == "" or userAddress == "":
                return Response(data,status=status.HTTP_400_BAD_REQUEST)

            # if there is no user matched,  <QuerySet []> returned
            user = User.objects.filter(walletAddress = userAddress)

            if user.count() == 0:
                return Response(data,status=status.HTTP_400_BAD_REQUEST)
            
            if user.count() > 1:
                return Response(data,status=status.HTTP_400_BAD_REQUEST)

            print("user : ", user)

            metaComments = MetaComment.objects.filter(urlAddress=urlAddress).order_by('-upVote')

            print("metaComments :::",metaComments)
            print(dir(metaComments))

           
        except MetaComment.DoesNotExist:
            return Response(data, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            if len(metaComments) >0:
                
                # function based view pagination 
                #  ref) https://stackoverflow.com/a/43493743
                paginator = StandardResultsSetPagination()
                result_page = paginator.paginate_queryset(metaComments, request)

                print("result_page :",result_page)

                serializer = MetaCommentVoteSerializer(result_page,userId=user[0].id,many=True)

                print("serializer.data ",serializer.data)
                print("==================================")
                print(dir(serializer.data))

                return paginator.get_paginated_response(serializer.data)

            else:
                return Response(data,status=status.HTTP_404_NOT_FOUND)

        return Response(data,status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print("===========e =========")
        print(e)
        print(dir(e))
        return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET',])
def get_metacomment_view(request, metaCommentId):
    data={}
    try:
        metaComment = MetaComment.objects.get(id=metaCommentId)
    except MetaComment.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        
        serializer =  MetaCommentSerializer(metaComment)
        data['status']='success'
        data['msg'] ='found meta comment'
        data['data'] = serializer.data
        return Response(data, status=status.HTTP_200_OK)

    return Response(data, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST',])
def create_metacomment_view(request):

    data={}

    if request.method == 'POST':

        if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address']:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(walletAddress= request.data['address'])
        except User.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)



        # take a look at donkey_ears/views.py
        # https://stackoverflow.com/q/30056762
        # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
        # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
        try:
            avubbleCrypted = request.data['avubbleCrypted']

            bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

            h2 = SHA256.new(bytesAvubbleCrypted)

            signaturePubKey = request.data["signaturePubKey"]

            key = RSA.import_key(signaturePubKey)

           
            pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
            
            print("The signature is valid.")

        except (ValueError, TypeError):
            print("The signature is not valid.")

            return Response(data,status= status.HTTP_400_BAD_REQUEST)



        print("found user by address ", user)
        # request.data._mutable = True
        request.data['user'] = user.id

        logger.info("===== request.data =====")
        logger.info(request.data)

        serializer = MetaCommentSerializer(data= request.data)

        
        # check content is empty
        #  ref) https://stackoverflow.com/a/9573259
        if not request.data['content']:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        # check urlAddress is empty
        #  ref) https://stackoverflow.com/a/9573259
        if not request.data['urlAddress']:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)


        if serializer.is_valid():
            serializer.save()
            data['status'] ='success'
            data['msg'] = 'created'
            data['data'] = serializer.data

            return Response(data, status=status.HTTP_201_CREATED)
        
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    return Response(data, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE',])
def delete_metacomment_view(request, metaCommentId):
    data={}
    try:
        metaComment = MetaComment.objects.get(id=metaCommentId)
    except MetaComment.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        operation = metaComment.delete()
        
        if operation:
            data['status']='success'
            data['msg'] ='deleted'
            return Response(data, status=status.HTTP_200_OK)

        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    return Response(data, status=status.HTTP_400_BAD_REQUEST)




@api_view(['PUT'])
def update_metacomment_view(request,metaCommentId):
    data={}

    try:
        metaComment = MetaComment.objects.get(id=metaCommentId)
    except MetaComment.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = MetaCommentSerializer(metaComment, data=request.data)

        if serializer.is_valid():
            serializer.save()
            data['status']='success'
            data['msg'] ='updated'
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
        
    return Response(data, status=status.HTTP_400_BAD_REQUEST)  






#############################################################################################################################
# user


@api_view(['GET',])
def get_user_list_view(request):
    data ={}

    try:
        users = User.objects.all()


    except User.DoesNotExist:
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if users.exists():
            
            # when i serialize array of object i neeto to add many option 
            # ref) https://stackoverflow.com/a/67563914
            serializer = UserSerializer(users,many=True)

            data['status'] ='success'
            data['msg']= 'getting user list success'
            data['data'] = serializer.data
            
            return Response(data)
        else:
            return Response(data,status=status.HTTP_404_NOT_FOUND)


    return Response(data,status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET',])
def get_user_view(request, userId):
    data={}
    try:
        user = User.objects.get(id=userId)
    except User.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer =  UserSerializer(user)
        data['status']='success'
        data['msg'] ='found user'
        data['data'] = serializer.data
        return Response(data, status=status.HTTP_200_OK)

    return Response(data, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST',])
def create_user_view(request):

    data={}

    if request.method == 'POST':
        # check urlAddress is empty
        #  ref) https://stackoverflow.com/a/9573259
        if not request.data['cryptedPrivKey']:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        privKey = request.data['cryptedPrivKey']
        bytePrivKey = bytes(privKey, 'utf-8')

        key = RSA.generate(1024)

        h = SHA256.new(bytePrivKey)

        signaturePrivKey = pkcs1_15.new(key).sign(h)

        request.data["signaturePrivKey"] = signaturePrivKey

        print("request.data : ",request.data)

        serializer = UserSerializer(data= request.data)

        # check content is empty
        #  ref) https://stackoverflow.com/a/9573259
        if not request.data['walletAddress']:
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            data['status'] ='success'
            data['msg'] = 'created'
            
            tempData = serializer.data

            print("serializer.data : ",serializer.data)

            # remove element from dictionary 
            #  ref) https://stackoverflow.com/a/11277439
            tempData.pop('signaturePrivKey', None)

            tempData['signaturePubKey'] = key.publickey().export_key()
            
            print("tempData : ",tempData)
            
            data['data'] = tempData
        
            return Response(data, status=status.HTTP_201_CREATED)

        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    return Response(data, status=status.HTTP_400_BAD_REQUEST)




@api_view(['DELETE',])
def delete_user_view(request, userId):
    data={}
    try:
        user = User.objects.get(id=userId)
    except User.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        operation = user.delete()
        
        if operation:
            data['status']='success'
            data['msg'] ='deleted'
            return Response(data, status=status.HTTP_200_OK)

        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    return Response(data, status=status.HTTP_400_BAD_REQUEST)




@api_view(['PUT'])
def update_user_view(request,userId):
    data={}

    try:
        user = user.objects.get(id=userId)
    except User.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = UserSerializer(user, data=request.data)

        if serializer.is_valid():
            serializer.save()
            data['status']='success'
            data['msg'] ='updated'
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
        
    return Response(data, status=status.HTTP_400_BAD_REQUEST)  





##################################################################################################################
# Vote

@api_view(['POST',])
def do_vote_view(request):

    data={}

    if request.method == 'POST':

        if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address'] or not request.data['metaComment'] :
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(walletAddress= request.data['address'])
        except User.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)

        # take a look at donkey_ears/views.py
        # https://stackoverflow.com/q/30056762
        # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
        # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
        try:
            avubbleCrypted = request.data['avubbleCrypted']

            bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

            h2 = SHA256.new(bytesAvubbleCrypted)

            signaturePubKey = request.data["signaturePubKey"]

            key = RSA.import_key(signaturePubKey)

           
            pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
            
            print("The signature is valid.")

        except (ValueError, TypeError):
            print("The signature is not valid.")

            return Response(data,status= status.HTTP_400_BAD_REQUEST)



        print("found user by address ", user)
        # request.data._mutable = True
        request.data['user'] = user.id

        logger.info("===== request.data =====")
        logger.info(request.data)

        # check whether user has been voted or not , if user has not voted, create vote
        #  if user has voted before, update vote status

        metaCommentId = request.data['metaComment']

        try:
           
            vote = Vote.objects.filter(user=user.id, metaComment=metaCommentId)
            
        except Vote.DoesNotExist:
            # user has not voted , so create vote

            print("vote does not exist")
    
            return Response(data,status= status.HTTP_404_NOT_FOUND)
    

        if(vote.exists()):
            # user has voted , so update vote
            print("~~~~~~~~~~~~~~~~~~~vote~~~~~~~~~~~~~~~~~~~")
            print(vote[0])
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(dir(vote[0]))

            print("user has voted")

            serializer = VoteSerializer(vote[0], data=request.data)

            print(serializer)
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(dir(serializer))

            try:
                metaComment = MetaComment.objects.get(id=metaCommentId)
            except MetaComment.DoesNotExist:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
            if(vote[0].voteVal == request.data["voteVal"]):
                # user vote same value as before, nothing to do
                serializer.save()
                data['status'] ='success'
                data['msg'] = 'updated'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
            
            if(request.data["voteVal"] == "up"):
                newUpVote = metaComment.upVote+1
                newDownVote = metaComment.downVote-1
            elif (request.data["voteVal"] == "down"):
                newUpVote = metaComment.upVote-1
                newDownVote = metaComment.downVote+1
            
            metaComment.upVote = newUpVote
            metaComment.downVote = newDownVote
            metaComment.save()

            if serializer.is_valid():
                print("validated try to save")

                serializer.save()
                data['status'] ='success'
                data['msg'] = 'updated'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
                
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
        else:
            # user has not voted , so create vote
            serializer = VoteSerializer(data= request.data)

            print(serializer)
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(dir(serializer))

            try:
                metaComment = MetaComment.objects.get(id=metaCommentId)
            except MetaComment.DoesNotExist:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
            if(request.data["voteVal"] == "up"):
                newUpVote = metaComment.upVote+1
                newDownVote = metaComment.downVote
            elif (request.data["voteVal"] == "down"):
                newUpVote = metaComment.upVote
                newDownVote = metaComment.downVote+1

            metaComment.upVote = newUpVote
            metaComment.downVote = newDownVote
            metaComment.save()


            if serializer.is_valid():
                print("validated try to save")

                serializer.save()
                data['status'] ='success'
                data['msg'] = 'created'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
                
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

    return Response(data, status=status.HTTP_400_BAD_REQUEST) 


############################################################################################################################
# Content


@api_view(['POST',])
def create_content_view(request):
    try:

        data={}

        if request.method == 'POST':

            if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(walletAddress= request.data['address'])
            except User.DoesNotExist:
                return Response(data,status= status.HTTP_404_NOT_FOUND)



            # take a look at donkey_ears/views.py
            # https://stackoverflow.com/q/30056762
            # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
            # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
            try:
                avubbleCrypted = request.data['avubbleCrypted']

                bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

                h2 = SHA256.new(bytesAvubbleCrypted)

                signaturePubKey = request.data["signaturePubKey"]

                key = RSA.import_key(signaturePubKey)

            
                pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
                
                print("The signature is valid.")

            except (ValueError, TypeError):
                print("The signature is not valid.")

                return Response(data,status= status.HTTP_400_BAD_REQUEST)



            print("found user by address ", user)
            request.data._mutable = True
            request.data['user'] = user.id

            logger.info("===== request.data =====")
            logger.info(request.data)

            serializer = ContentSerializer(data= request.data)

            


            
            # check content is empty
            #  ref) https://stackoverflow.com/a/9573259
            if not request.data['title']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

            # check urlAddress is empty
            #  ref) https://stackoverflow.com/a/9573259
            if not request.data['content']:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)


            if serializer.is_valid():
                logger.info("serializer is valid")
                serializer.save()
                data['status'] ='success'
                data['msg'] = 'created'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
            
            logger.info("===== serializer.errors =====")
            logger.info(serializer.errors)


            logger.info("===== serializer.validated_data =====")
            logger.info(serializer.validated_data)
            
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        return Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print("===========e =========")
        print(e)
        print(dir(e))
        return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)





@api_view(['GET',])
def get_content_list_by_user_recent_view(request):
    data ={}

    try:

        try:
            userAddress = request.GET.get('userAddress','')

            if userAddress == "":
                return Response(data,status=status.HTTP_400_BAD_REQUEST)

            # if there is no user matched,  <QuerySet []> returned
            user = User.objects.filter(walletAddress = userAddress)

            if user.count() == 0:
                return Response(data,status=status.HTTP_400_BAD_REQUEST)
            
            if user.count() > 1:
                return Response(data,status=status.HTTP_400_BAD_REQUEST)

            print("user : ", user)

            contents = Content.objects.filter(user=user[0].id).order_by('-created')

            print("contents :::",contents)
            print(dir(contents))

        except Content.DoesNotExist:
            return Response(data, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            if len(contents) >0:
                
            
                # function based view pagination 
                #  ref) https://stackoverflow.com/a/43493743
                paginator = StandardResultsSetPagination()
                result_page = paginator.paginate_queryset(contents, request)
                serializer = ContentVoteSerializer(result_page,userId=user[0].id, many=True)
                
                print("serializer.data ",serializer.data)
                print("==================================")
                print(dir(serializer.data))

                return paginator.get_paginated_response(serializer.data)

            else:
                return Response(data,status=status.HTTP_404_NOT_FOUND)

        return Response(data,status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print("===========e =========")
        print(e)
        print(dir(e))
        return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# this is for webpage served by server
# this shows content to anyone who asked for even though the one is not logged
@api_view(['GET',])
def get_content_view(request, contentId):
    try:
        data={}
        try:
            content = Content.objects.get(id=contentId)
        except Content.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer =  ContentSerializer(content)
            data['status']='success'
            data['msg'] ='found user'
            data['data'] = serializer.data
            return Response(data, status=status.HTTP_200_OK)

        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


@api_view(['GET'])
def get_content_with_vote_view(request, contentId):
    print("get_content_with_vote_view started")

    data ={}

    try:

        userAddress = request.GET.get('userAddress','')

        print("userAddress : ", userAddress)
        print("contentId : ", contentId)

        if userAddress == "":
            return Response(data,status=status.HTTP_400_BAD_REQUEST)

        # if there is no user matched,  <QuerySet []> returned
        user = User.objects.filter(walletAddress = userAddress)

        if user.count() == 0:
            return Response(data,status=status.HTTP_400_BAD_REQUEST)
        
        if user.count() > 1:
            return Response(data,status=status.HTTP_400_BAD_REQUEST)

        print("user : ", user)

        try:
            content = Content.objects.get(id=contentId)
        except Content.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)


        print("content :::",content)
        print(dir(content))

        if request.method == 'GET':
            
            serializer = ContentVoteSerializer(content, user[0].id)

            print("serializer.data ",serializer.data)
            print("==================================")
            print(dir(serializer.data))

            data['status']='success'
            data['msg'] ='found content'
            data['data'] = serializer.data
            return Response(data, status=status.HTTP_200_OK)

        return Response(data,status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print("===========e =========")
        print(e)
        print(dir(e))
        return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    

@api_view(['PUT'])
def update_content_as_minted_view(request):
    data={}

    if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address']:
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(walletAddress= request.data['address'])
    except User.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)



    # take a look at donkey_ears/views.py
    # https://stackoverflow.com/q/30056762
    # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
    # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
    try:
        avubbleCrypted = request.data['avubbleCrypted']

        bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

        h2 = SHA256.new(bytesAvubbleCrypted)

        signaturePubKey = request.data["signaturePubKey"]

        key = RSA.import_key(signaturePubKey)

    
        pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
        
        print("The signature is valid.")

    except (ValueError, TypeError):
        print("The signature is not valid.")

        return Response(data,status= status.HTTP_400_BAD_REQUEST)


    contentId = request.data['contentId']

    print("passed contentId to update_content_as_minted_view :",contentId)

    if(contentId == None or contentId == ""):
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    try:
        content = Content.objects.get(id=contentId)
    except Content.DoesNotExist:
        return Response(data,status= status.HTTP_404_NOT_FOUND)
    
    print("content.user.id :", content.user.id)

    if(user.id != content.user.id):
        # someone who is not the author of content is trying suspicious thing
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    content.isMinted = True
    
    if request.method == "PUT":
        
        content.save()
        
        data['status']='success'
        data['msg'] ='updated'
        return Response(data, status=status.HTTP_200_OK)
        
    return Response(data, status=status.HTTP_400_BAD_REQUEST)


        

###################################################################################
# VoteOnContent
#   

@api_view(['POST',])
def do_vote_content_view(request):

    data={}

    if request.method == 'POST':

        if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address'] or not request.data['content'] :
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(walletAddress= request.data['address'])
        except User.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)
        
        

        # take a look at donkey_ears/views.py
        # https://stackoverflow.com/q/30056762
        # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
        # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
        try:
            avubbleCrypted = request.data['avubbleCrypted']

            bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

            h2 = SHA256.new(bytesAvubbleCrypted)

            signaturePubKey = request.data["signaturePubKey"]

            key = RSA.import_key(signaturePubKey)

           
            pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
            
            print("The signature is valid.")

        except (ValueError, TypeError):
            print("The signature is not valid.")

            return Response(data,status= status.HTTP_400_BAD_REQUEST)



        print("found user by address ", user)
        
        request.data['user'] = str(user.id)
        request.data['toWhom'] = request.data['content']  

        logger.info("===== request.data =====")
        logger.info(request.data)

        try:
            voteOnContent = VoteOnContent.objects.filter(user=user.id, content=request.data['content'])
            
        except VoteOnContent.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)
        
    
        # check whether user has been voted or not , if user has not voted, create vote
        #  if user has voted before, update vote status
        if(voteOnContent.exists()):
            # user has voted , so update vote
            print("~~~~~~~~~~~~~~~~~~~voteOnContent~~~~~~~~~~~~~~~~~~~")
            print(voteOnContent[0])
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(dir(voteOnContent[0]))

            print("user has voted")

            serializer = VoteOnContentSerializer(voteOnContent[0], data=request.data)

            print(serializer)
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(dir(serializer))


            try:
                content = Content.objects.get(id= request.data['content'])
            except Content.DoesNotExist:
                return Response(data,status= status.HTTP_404_NOT_FOUND)

            
            if(voteOnContent[0].voteVal == request.data["voteVal"]):
                # user vote same value as before, nothing to do
                serializer.save()
                data['status'] ='success'
                data['msg'] = 'updated'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
            
            if(request.data["voteVal"] == "up"):
                newUpVote = content.upVote+1
                newDownVote = content.downVote-1
            elif (request.data["voteVal"] == "down"):
                newUpVote = content.upVote-1
                newDownVote = content.downVote+1
            
            content.upVote = newUpVote
            content.downVote = newDownVote
            content.save()










            if serializer.is_valid():
                print("validated try to save")

                serializer.save()
                data['status'] ='success'
                data['msg'] = 'updated'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
                
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
        else:
            # user has not voted , so create vote
            serializer = VoteOnContentSerializer(data= request.data)

            print(serializer)
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
            print(dir(serializer))






            try:
                content = Content.objects.get(id=request.data['content'])
            except Content.DoesNotExist:
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
            if(request.data["voteVal"] == "up"):
                newUpVote = content.upVote+1
                newDownVote = content.downVote
            elif (request.data["voteVal"] == "down"):
                newUpVote = content.upVote
                newDownVote = content.downVote+1

            content.upVote = newUpVote
            content.downVote = newDownVote
            content.save()


            if serializer.is_valid():
                print("validated try to save")

                serializer.save()
                data['status'] ='success'
                data['msg'] = 'created'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)








            if serializer.is_valid():
                print("validated try to save")

                serializer.save()
                data['status'] ='success'
                data['msg'] = 'created'
                data['data'] = serializer.data

                return Response(data, status=status.HTTP_201_CREATED)
                
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

    return Response(data, status=status.HTTP_400_BAD_REQUEST) 



##################################################################################################################
# Nft

@api_view(['POST',])
def create_nft_view(request):

    data={}

    if request.method == 'POST':

        if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address'] or not request.data['contentId'] :
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(walletAddress= request.data['address'])
        except User.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)

        # take a look at donkey_ears/views.py
        # https://stackoverflow.com/q/30056762
        # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
        # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
        try:
            avubbleCrypted = request.data['avubbleCrypted']

            bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

            h2 = SHA256.new(bytesAvubbleCrypted)

            signaturePubKey = request.data["signaturePubKey"]

            key = RSA.import_key(signaturePubKey)

           
            pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
            
            print("The signature is valid.")

        except (ValueError, TypeError):
            print("The signature is not valid.")

            return Response(data,status= status.HTTP_400_BAD_REQUEST)

        

        try:
            content = Content.objects.get(id= request.data['contentId'])
        except Content.DoesNotExist:
            return Response(data,status= status.HTTP_404_NOT_FOUND)

        
        try:
            nfts = Nft.objects.filter(content= request.data['contentId'])

            if(nfts.exists() and nfts[0].imgIpfs != "" and nfts[0].metaIpfs != ""):
                # content has been throuhg nft pre process before
               
                print("content has been through nft pre process before")

                data['status'] ='success'
                data['msg'] = 'nft preparation completed'
                data['data'] = {}

                return Response(data, status=status.HTTP_201_CREATED)
            elif (nfts.exists() and nfts[0].imgIpfs != "" and nfts[0].metaIpfs == ""):
                # content has been through nft pre process, but not finished. need to do metaIpfs

                print('content has been through nft pre process, but not finished. need to do metaIpfs')

                try:
                    metadataCid = pinMetadata(request.data['contentId'], user, content, nfts[0].imgIpfs)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                try:
                    updatedNft = Nft(id=nfts[0].id, content =nfts[0].content, imgIpfs= nfts[0].imgIpfs , metaIpfs=metadataCid, created = timezone.now())
                    updatedNft.save()
                
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                try:
                    setUriOnSmartContract(content.id, metadataCid)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                data['status'] ='success'
                data['msg'] = 'nft preparation completed'
                data['data'] = {}
            
                return Response(data, status=status.HTTP_201_CREATED)


            elif (nfts.exists() and nfts[0].imgIpfs == "" and nfts[0].metaIpfs == ""):
                # content has been through nft pre process. but not finished. need to do imgIpfs and metaIpfs

                print('content has been through nft pre process. but not finished. need to do imgIpfs and metaIpfs')

                try:
                    imgCid = pinImg(request.data['contentId'], user, content)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                try:
                    metadataCid = pinMetadata(request.data['contentId'], user, content, imgCid)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                try:
                    updatedNft = Nft(id=nfts[0].id, content =nfts[0].content, imgIpfs= imgCid , metaIpfs=metadataCid, created = timezone.now())
                    updatedNft.save()
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                try:
                    setUriOnSmartContract(content.id, metadataCid)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                data['status'] ='success'
                data['msg'] = 'nft preparation completed'
                data['data'] = {}
            
                return Response(data, status=status.HTTP_201_CREATED)

            else:
                # content has NOT been through nft pre process

                print('content has NOT been through nft pre process')

                try:
                    imgCid = pinImg(request.data['contentId'], user, content)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                try:
                    metadataCid = pinMetadata(request.data['contentId'], user, content, imgCid)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                try:
                    Nft.objects.create(content_id=request.data['contentId'], imgIpfs = imgCid, metaIpfs = metadataCid)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                try:
                    setUriOnSmartContract(content.id, metadataCid)
                except Exception as e:
                    print("===========e =========")
                    print(e)
                    print(dir(e))
                    return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                data['status'] ='success'
                data['msg'] = 'nft preparation completed'
                data['data'] = {}
            
                return Response(data, status=status.HTTP_201_CREATED)


        except Exception as e:
            print("===========e =========")
            print(e)
            print(dir(e))
            return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    return Response(data, status=status.HTTP_400_BAD_REQUEST) 


def pinImg(contenId, user, content):
    # get secret ref) https://stackoverflow.com/a/61437799
    pinataJwtToken = config('PINATA_JWT_TOKEN')

    # access media file in view ref) https://stackoverflow.com/a/43630328
    media_root = settings.MEDIA_ROOT

    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    payload={
        # 'pinataOptions': '{"cidVersion": 1, "wrapWithDirectory": true }',
        'pinataOptions': '{"cidVersion": 1}',
        'pinataMetadata': '{"name": "content_NFT_img_'+contenId+'", "keyvalues": {"userId": "'+str(user.id)+'","walletAddress":"'+user.walletAddress+'","contentCreated":"'+content.created.isoformat()+'","imgIpfsCreated":"'+ timezone.now().isoformat()+'"}}'
        }

    files=[
        ('file',('b.png',open(media_root +'/'+content.image1.name,'rb')))
    ]

    # params = [('title', 'file1'), ('title', 'file2')]
    headers = {
        # 'content-type': 'multi-part/form-data',
        'Authorization': 'Bearer '+pinataJwtToken,
    }

    # https://dweb.link/ipfs/
    # .ipfs.w3s.link    ``

    response = requests.request("POST", url, headers=headers, data=payload, files=files)

    jsonObj = json.loads(response.text)
    return jsonObj['IpfsHash']

def pinMetadata(contenId, user, content, imgCid):
    # get secret ref) https://stackoverflow.com/a/61437799
    pinataJwtToken = config('PINATA_JWT_TOKEN')

    # access media file in view ref) https://stackoverflow.com/a/43630328
    media_root = settings.MEDIA_ROOT

    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

    payload = json.dumps({
    "pinataOptions": {
        "cidVersion": 1
    },
    "pinataMetadata": {
        "name":  "content_NFT_metadata_"+contenId,
        "keyvalues": {
        "userId":user.id,
        "walletAddress": user.walletAddress,
        "contentCreated": content.created.isoformat(),
        "metaIpfsCreated": timezone.now().isoformat()
        }
    },
    "pinataContent": {
        "image": "https://gateway.pinata.cloud/ipfs/"+imgCid,
        "name": content.title,
        "description": content.content
    }
    })
    headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+pinataJwtToken
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    jsonObj = json.loads(response.text)
    return jsonObj['IpfsHash']




def setUriOnSmartContract(contentId, metaIpfs):

    # get secret ref) https://stackoverflow.com/a/61437799
    wallet_address = config('WALLET_ADDRESS')
    pri_key = config('WALLET_PRI_KEY')
    alchemy_url = config('ALCHEMY_MUMBAI_HTTP_URL')
    mumbai_contract_address = config('MUMBAI_NFT_CONTRACT_ADDRESS')

    # alchemy_url = "https://polygon-mumbai.g.alchemy.com/v2/Uud_P7gk4UKBPIgcNN2nV3jsEbhn1R5Z"
    w3 = Web3(Web3.HTTPProvider(alchemy_url))

    #get the nonce.  Prevents one from sending the transaction twice
    nonce = w3.eth.getTransactionCount(wallet_address)

    #build a transaction in a dictionary
    options = {
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.toWei('50', 'gwei')
    }

    abi = '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"burnBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"exists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxQtyUserMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"mintByOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintByUser","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setMintFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_uri","type":"string"}],"name":"setOneUri","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newuri","type":"string"}],"name":"setURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uris","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]'
    contract_instance = w3.eth.contract(address=mumbai_contract_address, abi=abi)

    tx = contract_instance.functions.setOneUri(contentId,"https://gateway.pinata.cloud/ipfs/"+metaIpfs).buildTransaction(options)

    signed_tx = w3.eth.account.signTransaction(tx, private_key=pri_key)

    w3.eth.sendRawTransaction(signed_tx.rawTransaction)












# i was trying to do with web3 storage
# 
# @api_view(['POST',])
# def create_nft_view(request):

#     data={}

#     if request.method == 'POST':

#         if not request.data['signaturePubKey'] or not request.data['avubbleCrypted'] or not request.data['address'] or not request.data['contentId'] :
#             return Response(data, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             user = User.objects.get(walletAddress= request.data['address'])
#         except User.DoesNotExist:
#             return Response(data,status= status.HTTP_404_NOT_FOUND)

#         # take a look at donkey_ears/views.py
#         # https://stackoverflow.com/q/30056762
#         # https://www.pycryptodome.org/src/signature/pkcs1_v1_5
#         # https://www.pycryptodome.org/src/examples#generate-an-rsa-key 
#         try:
#             avubbleCrypted = request.data['avubbleCrypted']

#             bytesAvubbleCrypted = bytes(avubbleCrypted, 'utf-8')

#             h2 = SHA256.new(bytesAvubbleCrypted)

#             signaturePubKey = request.data["signaturePubKey"]

#             key = RSA.import_key(signaturePubKey)

           
#             pkcs1_15.new(key).verify(h2, user.signaturePrivKey)
            
#             print("The signature is valid.")

#         except (ValueError, TypeError):
#             print("The signature is not valid.")

#             return Response(data,status= status.HTTP_400_BAD_REQUEST)

#         try:
#             nfts = Nft.objects.filter(content= request.data['contentId'])

#             if(nfts.exists()):
#                 # content has been throuhg nft pre process before
#                 print("~~~~~~~~~~~~~~~~~~~nft~~~~~~~~~~~~~~~~~~~")
#                 print(nfts[0])
#                 print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
#                 print(dir(nfts[0]))

#                 print("content has been through nft pre process before")

#                 temp ={ipfs:nfts[0].ipfs}

#                 data['status'] ='success'
#                 data['msg'] = 'created'
#                 data['data'] = temp

#                 return Response(data, status=status.HTTP_201_CREATED)
#             else:
#                 # content has not bee through nft pre process. let it go through

#                 print('content has not been through nft pre process. let it go through')

#                 # get secret ref) https://stackoverflow.com/a/61437799
#                 web3StorageToken = config('WEB3_STORAGE_TOKEN')

#                 # access media file in view ref) https://stackoverflow.com/a/43630328
#                 media_root = settings.MEDIA_ROOT

#                 url = "https://api.web3.storage/upload"

#                 payload={}

#                 # with open(media_root +'/445intro.png','rb') as f1 , open(media_root +'/445intro.png','rb') as f2:
#                 #     print('f1 : ')
#                 #     print(dir(f1))

#                 #     files = [f1, f2]

#                 # files= {'media':open(media_root +'/445intro.png','rb')}
#                 # files=[
#                 #     ('images',('@a.png',open(media_root +'/445intro.png','rb'),'image/png')),
#                 #     ('images',('@a.png',open(media_root +'/445intro.png','rb'),'image/png')),
#                 #     # ('upload_file',('b.png',open(media_root +'/445intro.png','rb'),'image/png'))
#                 # ]
#                 files=[
#                     ('file1',('test.txt',open(media_root +'/test.txt','rb'),'text/plain')),
#                     # ('file1',('445intro.png',open(media_root +'/445intro.png','rb'),'image/png')),
#                     # ('file2',('eco_rate.jpg',open(media_root +'/eco_rate.jpg','rb'),'image/jpg')),
#                     # ('upload_file',('b.png',open(media_root +'/445intro.png','rb'),'image/png'))
#                 ]

#                 # params = [('title', 'file1'), ('title', 'file2')]
#                 headers = {
#                     "accept": "application/json",
#                     'content-type': 'multi-part/form-data',
#                     # "Content-Disposition" : "form-data",
#                     'Authorization': 'Bearer '+web3StorageToken,
#                     'X-NAME':'jacob'

#                 }

#                 # https://dweb.link/ipfs/
#                 # .ipfs.w3s.link    ``

#                 response = requests.request("POST", url, headers=headers, data=payload, files=files)
                

#                 # print('response :')
#                 # # print(dir(response))
#                 # print(response.text)

#                 # prepare = requests.Request("POST", url, headers=headers, data=payload, files=files,params=params )
#                 # prepare = requests.Request("POST", url, headers=headers, data=payload, files=files)
                

#                 # print("prepare.prepare :")
#                 # print(dir(prepare.prepare))

#                 # print("prepare.headers :",prepare.headers)
#                 # print(dir(prepare.headers))

#                 # print(dict(prepare.headers))

#                 # print(prepare.body)




#                 return Response({}, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             print("===========e =========")
#             print(e)
#             print(dir(e))
#             return Response(data,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
#     return Response(data, status=status.HTTP_400_BAD_REQUEST) 