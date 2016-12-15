"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request
import requests
from TVRecording import app

loginInfo = {"apikey": "7E99A86F07764359", "username": "jk12559", "userkey": "6785F3BB1D3910F1"}

@app.route('/')
def home():
    """Renders the home page."""
    return render_template(
        'index.html'
    )

@app.route('/authenticate')
def authenticate():
    global token
    loginRequest = requests.post("https://api.thetvdb.com/login", json = loginInfo)
    token = loginRequest.json()['token']
    return token

@app.route('/showSearch', methods=['POST'])
def showSearch():
    search = request.json['search']
    headers = {'Authorization': 'Bearer ' + token}
    showResponse = requests.get('https://api.thetvdb.com/search/series', params = {'name': search}, headers = headers)
    return showResponse.text