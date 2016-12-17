"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request
import requests
from TVRecording import app
import sqlite3
import os
import pandas as pd
import json

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

@app.route('/addToDB', methods = ["POST"])
def addToDB():
    db = sqlite3.connect(os.path.join(app.root_path, 'tvrecording.db'))
    c = db.cursor()
    show = request.data
    showSpace = show.find(' ')
    showID = show[:showSpace]
    showName = show[showSpace+3:]
    c.execute('INSERT OR IGNORE INTO SHOWS (ID, NAME) VALUES ({ID}, {NAME})'.format(ID = showID, NAME = sQ(showName)))
    db.commit()
    db.close()
    return 'added'

@app.route('/showList')
def showList():
    db = sqlite3.connect(os.path.join(app.root_path, 'tvrecording.db'))
    shows = pd.read_sql('SELECT * FROM SHOWS', db)
    db.close()
    return json.dumps([x for x in shows.T.to_dict().itervalues()])


def sQ(text):
    return "'" + text + "'"