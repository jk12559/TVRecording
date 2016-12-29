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
    with app.open_resource('dbPrep.sql', mode = 'r') as f:
        db = sqlite3.connect(os.path.join(app.root_path, 'tvrecording.db'))
        db.cursor().executescript(f.read())
        db.commit()
        db.close()
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

    episodes = getEpisodes(showID)
    for episode in episodes:
        if episode['firstAired']:
            print episode['id']
            c.execute('INSERT OR IGNORE INTO EPISODES (ID, SHOW_NAME, EPISODE_NAME, DATE_AIRED, SEASON, EPISODE_NUM, RECORDED) VALUES ({ID}, {SHOW_NAME}, {EPISODE_NAME}, DATE({DATE_AIRED}), {SEASON}, {EPISODE_NUM}, 0)'.format(ID = int(episode['id']),
                                                                                                                                                                              SHOW_NAME = dQ(showName),
                                                                                                                                                                              EPISODE_NAME = dQ(episode['episodeName'].encode('utf-8')),
                                                                                                                                                                              DATE_AIRED = dQ(episode['firstAired']),
                                                                                                                                                                              SEASON = int(episode['airedSeason']),
                                                                                                                                                                              EPISODE_NUM = int(episode['airedEpisodeNumber'])))
    db.commit()
    db.close()
    return 'added'

@app.route('/showList')
def showList():
    db = sqlite3.connect(os.path.join(app.root_path, 'tvrecording.db'))
    shows = pd.read_sql('SELECT * FROM SHOWS', db)
    db.close()
    return json.dumps([x for x in shows.T.to_dict().itervalues()])

@app.route('/episodeList')
def episodeList():
    db = sqlite3.connect(os.path.join(app.root_path, 'tvrecording.db'))
    episodes = pd.read_sql('SELECT * FROM EPISODES ORDER BY DATE_AIRED ASC', db)
    db.close()
    return episodes.T.to_json()
    #return json.dumps([x for x in episodes.T.to_dict().itervalues()])

def sQ(text):
    return "'" + text + "'"

def dQ(text):
    return '"' + text + '"'

def getEpisodes(show):
    #show is id number of the show
    headers = {'Authorization': 'Bearer ' + token}
    episodes = []
    next = 1
    while next != None:
        episodesResponse = requests.get('https://api.thetvdb.com/series/{id}/episodes'.format(id = show), params = {'page': next}, headers = headers)
        result = episodesResponse.json()
        episodes.extend(result['data'])
        next = result['links']['next']
    return episodes

@app.route('/setRecorded', methods = ["POST"])
def setRecorded():
    id = request.data
    print id
    return 'set'