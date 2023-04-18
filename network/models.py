from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings



class User(AbstractUser):
    pass

class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "author_id": self.author.id,
            "content": self.content,
            "likes": self.likes.count(),
            "likes_ids": [user.id for user in self.likes.all()],
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }

    def __str__(self):
        return self.content

    def get_absolute_url(self):
        return reverse('post_detail', args=[str(self.id)])

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
