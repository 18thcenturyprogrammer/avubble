from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    walletAddress =  models.CharField(max_length=200, blank=False, null=False)
    cryptedPrivKey =  models.CharField(max_length=500, blank=False, null=False)
    # signaturePrivKey =  models.CharField(max_length=500, blank=False, null=False)
    signaturePrivKey =  models.BinaryField(max_length=1000, editable=True, blank=False, null=False)
    emailAddress = models.CharField(max_length=200, blank=True, null=True)
    varifiedEmail = models.BooleanField(default = False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)


class Content(models.Model):
    id = models.AutoField(primary_key=True)
    title =  models.CharField(max_length=200, blank=False, null=False)
    content =  models.CharField(max_length=1000, blank=False, null=False)
    image1 = models.ImageField(blank=True, null = True, default='avubble_logo.png')
    upVote = models.IntegerField(default = 0)
    downVote = models.IntegerField(default = 0)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    isMinted = models.BooleanField(default=False)


class MetaComment(models.Model):
    id = models.AutoField(primary_key=True)
    content =  models.CharField(max_length=1000, blank=False, null=False)
    urlAddress =  models.CharField(max_length=500, blank=False, null=False)
    upVote = models.IntegerField(default = 0)
    downVote = models.IntegerField(default = 0)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    

class Vote(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    metaComment = models.ForeignKey(MetaComment, on_delete=models.CASCADE)   
    voteVal = models.CharField(max_length=50, blank=False, null=False)
    created = models.DateTimeField(auto_now_add=True)
    toWhom = models.IntegerField()
    

class VoteOnContent(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    content = models.ForeignKey(Content, on_delete=models.CASCADE)   
    voteVal = models.CharField(max_length=50, blank=False, null=False)
    created = models.DateTimeField(auto_now_add=True)
    toWhom = models.IntegerField()


class Nft(models.Model):
    id = models.AutoField(primary_key=True)
    content =  models.ForeignKey(Content, on_delete=models.CASCADE)
    metaIpfs =  models.CharField(max_length=500, blank=False, null=False,default ="")
    imgIpfs =  models.CharField(max_length=500, blank=False, null=False, default ="")
    created = models.DateTimeField(auto_now_add=True)