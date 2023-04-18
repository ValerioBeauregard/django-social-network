
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),
    path("new/post", views.new_post, name="new_post"),
    path("post/edit", views.editing_post, name="editing_post"),
    path("post/like", views.like, name="like"),
    path("post/get/all", views.get_all_posts, name="get_all_posts"),
    path("post/get/user", views.get_user_posts, name="get_user_posts"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("profile/get/info", views.get_profile_info, name="get_profile_info"),
    path("profile/get/dashboard", views.dashboard, name="dashboard"),
    path("users/follow", views.follow, name="follow")
]
