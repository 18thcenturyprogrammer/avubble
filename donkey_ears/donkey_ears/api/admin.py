from django.contrib import admin

# Register your models here.
from .models import MetaComment, User, Content, Vote, VoteOnContent


admin.site.register(MetaComment)
admin.site.register(User)
admin.site.register(Content)
admin.site.register(Vote)
admin.site.register(VoteOnContent)
