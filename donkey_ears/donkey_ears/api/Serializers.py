
import logging
logger = logging.getLogger("mylogger")
from django.core.exceptions import ValidationError

# odered dictionary ref) https://www.geeksforgeeks.org/ordereddict-in-python/
from collections import OrderedDict

from django.conf import settings
from rest_framework import serializers
from api.api_errors import MoreThanTwoVoteError,NotFoundUserId


from api.models import MetaComment, User , Vote, Content,VoteOnContent, Nft

# file size validation
# ref) https://www.codesnippet.dev/jvorcak/validating-image-dimensions-and-size-in-django-rest-framework
def image_size_validator(image):
    filesize = image.size

    print("file size is : ",filesize)
    

    if filesize > 1024000:
        raise ValidationError(f"You need to upload an image which is smaller than 1 mb")
    



class MetaCommentSerializer(serializers.ModelSerializer):
    # django rest serializer method field
    # ref) https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield
    userObj = serializers.SerializerMethodField()

    class Meta:
        model = MetaComment
        fields =['id','content','urlAddress','downVote','upVote','user','created','updated','userObj']
    
    def get_userObj(self, metaComment):

        # logger.info("===== price =====")
        # logger.info(dir(price))

        # logger.info("===== price.path =====")
        # logger.info(dir(price.path))

        # serializing parent model including child model
        # ref) https://stackoverflow.com/a/50991873 

        print("get user obj****************************")
        print(UserSerializer(metaComment.user).data)
        print("=========================")
        print(dir(UserSerializer(metaComment.user).data))

        userOrderedDic = UserSerializer(metaComment.user).data

        # about ReturnDic ref) https://stackoverflow.com/a/35423026
        # remove element from ordered dictionary 
        #  ref) https://www.digitalocean.com/community/tutorials/python-ordereddict
        userOrderedDic.pop('cryptedPrivKey')
        userOrderedDic.pop('signaturePrivKey')
        userOrderedDic.pop('emailAddress')
        userOrderedDic.pop('varifiedEmail')

        return userOrderedDic


# when user ask for metacomment with vote infos
# this is used
class MetaCommentVoteSerializer(serializers.ModelSerializer):
    userId = 0 

    # django rest serializer method field
    # ref) https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield
    userObj = serializers.SerializerMethodField()
    voteObj = serializers.SerializerMethodField()

    class Meta:
        model = MetaComment
        fields =['id','content','urlAddress','downVote','upVote','user','created','updated','userObj','voteObj']

    # i added additional init argument for searching vote for user id
    def __init__(self,metaComment, userId,**kwargs):
        print("metacomment with vote serializer __init__ is callled , userId is :",userId)
        super().__init__(metaComment,**kwargs)
        self.userId = userId
        
            
    def get_userObj(self, metaComment):

        # serializing parent model including child model
        # ref) https://stackoverflow.com/a/50991873 

        userOrderedDic = UserSerializer(metaComment.user).data

        # about ReturnDic ref) https://stackoverflow.com/a/35423026
        # remove element from ordered dictionary 
        #  ref) https://www.digitalocean.com/community/tutorials/python-ordereddict
        userOrderedDic.pop('cryptedPrivKey')
        userOrderedDic.pop('signaturePrivKey')
        userOrderedDic.pop('emailAddress')
        userOrderedDic.pop('varifiedEmail')

        return userOrderedDic

    def get_voteObj(self, metaComment):

        # serializing parent model including child model
        # ref) https://stackoverflow.com/a/50991873 

        if (self.userId ==0):
            raise NotFoundUserId("user id is not passed")

        votes = metaComment.vote_set.filter(user = self.userId)

        print("=========== votes ==============")
        print(votes)
        
        od = OrderedDict()
        
        if votes.count() ==0:
            od["voteVal"] = "" 
        elif votes.count() == 1:
            od["voteVal"] = votes[0].voteVal
        elif votes.count() > 1:
            raise MoreThanTwoVoteError("there are more than 2 votes")

        return od
    


class ContentSerializer(serializers.ModelSerializer):
    # django rest serializer method field
    # ref) https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield
    userObj = serializers.SerializerMethodField()
    img1_url = serializers.SerializerMethodField()

    class Meta:
        model = Content
        fields =['id','title','content','image1','img1_url','upVote','downVote','user','created','updated','isMinted', 'userObj']

    image1 = serializers.ImageField(validators=[image_size_validator], required=False)

    def get_userObj(self, content):

        # logger.info("===== price =====")
        # logger.info(dir(price))

        # logger.info("===== price.path =====")
        # logger.info(dir(price.path))

        # serializing parent model including child model
        # ref) https://stackoverflow.com/a/50991873 

        print("get user obj****************************")
        print(UserSerializer(content.user).data)
        print("=========================")
        print(dir(UserSerializer(content.user).data))

        userOrderedDic = UserSerializer(content.user).data

        # about ReturnDic ref) https://stackoverflow.com/a/35423026
        # remove element from ordered dictionary 
        #  ref) https://www.digitalocean.com/community/tutorials/python-ordereddict
        userOrderedDic.pop('cryptedPrivKey')
        userOrderedDic.pop('signaturePrivKey')
        userOrderedDic.pop('emailAddress')
        userOrderedDic.pop('varifiedEmail')

        return userOrderedDic
    
    def get_img1_url(self, content):
        
        path= get_absoulute_path()


        # print('========== content.image1.name ============')
        # print(dir(content.image1.name))


        print('========== content.image1.name ============')
        print(content.image1.name)

        print('========== content.image1.url ============')
        print(content.image1.url)

        return path['SITE_PROTOCOL_URL']+content.image1.url

    


# when user ask for content with vote infos
# this is used
class ContentVoteSerializer(serializers.ModelSerializer):
    userId = 0

    # django rest serializer method field
    # ref) https://www.django-rest-framework.org/api-guide/fields/#serializermethodfield
    userObj = serializers.SerializerMethodField()
    voteObj = serializers.SerializerMethodField()
    img1_url = serializers.SerializerMethodField()

    class Meta:
        model = Content
        fields =['id','title','content','image1','img1_url','downVote','upVote','user','created','updated','isMinted','userObj','voteObj']

    # i added additional init argument for searching vote for user id
    def __init__(self,content, userId,**kwargs):
        print("content with vote serializer __init__ is callled , userId is :",userId)
        super().__init__(content,**kwargs)
        self.userId = userId

    def get_userObj(self, content):

        # serializing parent model including child model
        # ref) https://stackoverflow.com/a/50991873 

        userOrderedDic = UserSerializer(content.user).data

        # about ReturnDic ref) https://stackoverflow.com/a/35423026
        # remove element from ordered dictionary 
        #  ref) https://www.digitalocean.com/community/tutorials/python-ordereddict
        userOrderedDic.pop('cryptedPrivKey')
        userOrderedDic.pop('signaturePrivKey')
        userOrderedDic.pop('emailAddress')
        userOrderedDic.pop('varifiedEmail')

        return userOrderedDic

    def get_voteObj(self, content):

        # serializing parent model including child model
        # ref) https://stackoverflow.com/a/50991873 

        votes = content.voteoncontent_set.filter(user = self.userId)
        
        od = OrderedDict()
        
        if votes.count() ==0:
            od["voteVal"] = "" 
        elif votes.count() == 1:
            od["voteVal"] = votes[0].voteVal
        elif votes.count() > 1:
            raise MoreThanTwoVoteError("there are more than 2 votes")

        return od


    def get_img1_url(self, content):
        
        path= get_absoulute_path()


        # print('========== content.image1.name ============')
        # print(dir(content.image1.name))


        print('========== content.image1.name ============')
        print(content.image1.name)

        print('========== content.image1.url ============')
        print(content.image1.url)

        return path['SITE_PROTOCOL_URL']+content.image1.url



        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields =['id','walletAddress','cryptedPrivKey','signaturePrivKey','emailAddress','varifiedEmail','created','updated']


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields =['id','user','metaComment','voteVal','created','toWhom']


class VoteOnContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoteOnContent
        fields =['id','user','content','voteVal','created','toWhom']


class NftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nft
        fields =['id','content','ipfs','created']




########################################################################################################################## 
# utility functions




# for providing absolute path 
#  ref) https://stackoverflow.com/a/27609150
def get_absoulute_path():

    SITE_PROTOCOL_RELATIVE_URL = '//' + settings.SITE_URL

    SITE_PROTOCOL = 'http'

    SITE_PROTOCOL_URL = SITE_PROTOCOL + '://' + settings.SITE_URL

    return {
        'SITE_URL': settings.SITE_URL,
        'SITE_PROTOCOL': SITE_PROTOCOL,
        'SITE_PROTOCOL_URL': SITE_PROTOCOL_URL,
        'SITE_PROTOCOL_RELATIVE_URL': SITE_PROTOCOL_RELATIVE_URL
    }