import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follow


def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def new_post(request):
    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    user = User.objects.get(username=request.user.username)
    data = json.loads(request.body)

    try:
        newPost = Post.objects.create(author=user, content=data.get("content"))
        newPost.save()
        return JsonResponse({
            "Response": f"Post saved!"
        }, status=200)
    except Exception as e:
        return JsonResponse({
            "error": f"Problem placeing your post."
        }, status=400)

@csrf_exempt
def get_all_posts(request):
    # Query for requested email
    try:
        posts = Post.objects.all().order_by('-timestamp')

    except Exception as e:
        return JsonResponse({
            "error": f"Internal error getting data."
        }, status=400)

    # Return email contents
    if request.method == "GET":
        return JsonResponse([post.serialize() for post in posts], safe=False)

@csrf_exempt
def get_user_posts(request):
    if request.method == "POST":
        # Getting requested user id
        data = json.loads(request.body)
        user_id = data.get("user_id")
        requested_user_info = User.objects.get(id=user_id)

        # Query for requested email
        try:
            posts = Post.objects.filter(author=requested_user_info).order_by('-timestamp')

        except Exception as e:
            return JsonResponse({
                "error": f"Internal error getting data."
            }, status=400)


        return JsonResponse([post.serialize() for post in posts], safe=False)

    else:
        JsonResponse({
                "error": f"Method POST is required."
            }, status=400)

def profile(request, user_id):
    return render(request, "network/profile.html", {'user_id': user_id})

@csrf_exempt
def following(request):
    if request.user.is_authenticated:

        if request.method == "POST":
            # Getting current user id
            user_id = request.user.id

            # Getting requested user id
            current_user = User.objects.get(id=user_id)

            # Query for requested email
            try:
                followed_users = [following.followed for following in current_user.following.all()]
                posts = Post.objects.filter(author__in=followed_users).order_by('-timestamp')

            except Exception as e:
                return JsonResponse({
                    "error": f"Internal error getting data."
                }, status=400)


            return JsonResponse([post.serialize() for post in posts], safe=False)
        else:
            return render(request, "network/following.html")

    else:
        return HttpResponseRedirect(reverse("login"))

@csrf_exempt
def get_profile_info(request):
    if request.method == "POST":
        # Getting requested user id
        data = json.loads(request.body)
        user_id = data.get("user_id")

        # Getting users info
        requested_user_info = User.objects.get(id=user_id)
        current_user_info = request.user

        # Determining whether the "follow button" will be enabled or not
        if current_user_info.id == requested_user_info.id:
            follow_button = False
        else:
            follow_button = True

        # Gettig follow interaction if exist
        following_exist = Follow.objects.filter(follower=current_user_info, followed=requested_user_info).exists()


        data_return = {
            "user_id": requested_user_info.id,
            "username": requested_user_info.username,
            "follow_button": follow_button,
            "following_exist": following_exist
        }

        return JsonResponse(data_return, safe=False)

@csrf_exempt
def follow(request):
    if request.method == "POST":
        # Getting requested user id
        data = json.loads(request.body)
        user_id = data.get("user_id")

        # Getting users info
        requested_user_info = User.objects.get(id=user_id)
        current_user_info = request.user


        # Applying following
        new_following = Follow(follower=current_user_info, followed=requested_user_info)

        # Saving interaction
        new_following.save()

        data_return = {
            "message": 'Folled!'
        }

        return JsonResponse(data_return, safe=False)

    elif request.method == "PUT":
        # Getting requested user id
        data = json.loads(request.body)
        user_id = data.get("user_id")

        # Getting users info
        requested_user_info = User.objects.get(id=user_id)
        current_user_info = request.user


        # Applying delete following
        following = Follow.objects.get(follower=current_user_info, followed=requested_user_info)

        # Deleting interaction
        following.delete()

        data_return = {
            "message": 'UnFolled!'
        }

        return JsonResponse(data_return, safe=False)

@csrf_exempt
def dashboard(request):
    if request.method == "POST":
        # Getting requested user id
        data = json.loads(request.body)
        user_id = data.get("user_id")

        # Getting users info
        requested_user_info = User.objects.get(id=user_id)

        # Getting number of post for requested user
        num_posts = Post.objects.filter(author=requested_user_info).count()

        # Gettig followers number
        num_followers = Follow.objects.filter(followed=requested_user_info).count()
        num_followed = Follow.objects.filter(follower=requested_user_info).count()


        data_return = {
            "posts": num_posts,
            "followers": num_followers,
            "following": num_followed
        }

        return JsonResponse(data_return, safe=False)

@csrf_exempt
def editing_post(request):
    if request.user.is_authenticated:

        if request.method == "POST":
            # Getting data from frontend
            data = json.loads(request.body)
            postId = data.get("postId")
            newContent = data.get("newContent")

            # Getting current user id
            user_id = request.user.id

            post = Post.objects.get(id=postId)

            if post.author.id == user_id:
                # Query
                try:
                    post.content = newContent
                    post.save()
                except Exception as e:
                    return JsonResponse({
                        "error": f"Internal error saving data."
                    }, status=400)

                return JsonResponse({'message': 'Editing post succes!'}, safe=False)
            else:
                return JsonResponse({'message': 'You are not authorized to edit this content'}, safe=False)

        else:
            return JsonResponse({"error": "POST request required."}, status=400)

@csrf_exempt
@login_required
def like(request):
    if request.method == "POST":
        # Getting current user
        user = request.user

        # Getting requested post id
        data = json.loads(request.body)
        post_id = data.get("postId")

        # Getting users info
        post = Post.objects.get(pk=post_id)

        # Controling if add or remove
        if post.likes.filter(pk=user.pk).exists():
            post.likes.remove(user)
        else:
            post.likes.add(user)

        # Saving changes
        post.save()

        # Returning message
        data_return = {
            "message": 'Like chamge applyed!'
        }

        return JsonResponse(data_return, safe=False)

    else:
        return JsonResponse({"error": "POST request required."}, status=400)
