# Like twitter Django Social Network

This web aplication is written in python, javascript and html with Django framwork, its interaction is like twitter post mechanism. Users are able to create and log in into their accounts. Users are able to make public posts, like it posts, watch other users profile, follow up other users and see the most recent posts from followed users.

## Considerations to make it run
1. Be sure your local server already have installed:
```
Python 3.6
Pip
```

2. Its recommended to set up a virtual enviroment to install local dependencies, just execute the following code in the root folder of the proyect to create the local enviroment:
```
python -m venv venv
```
After that, activate the local enviroment:
```
source venv/bin/activate
```
** * With this, your local enviroment most be ready * **

3. In your local venv install Django:
```
pip install Django
```
4. In order to create a test sqlite3 database, and writte down the necesary tables in it, execute the following commands:
```
python manage.py makemigrations
```
```
python manage.py migrate
```
5. After that all is done to make it run with next command:
```
python manage.py runserver
```
6. Code and enlloy

Note: Any problem during the setting up of the aplication, please visit the official [Django Documentation](https://docs.djangoproject.com/en/4.2/) projects.
