function start() {
    authenticate();
}

function authenticate() {
    var request = new XMLHttpRequest();
    request.open("GET", "/authenticate");
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            token = request.responseText;
            refreshEpisodes();
        }
    }
    request.send();
}

function getAddShowForm() {
    var test = window.open('/addShow', 'Add Show', 'width=800,height=600,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=20,top=20');
}

function getShowList() {
    var request = new XMLHttpRequest();
    request.open('GET', '/showList');
    request.setRequestHeader('Content-type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            shows = request.response;
            shows = JSON.parse(shows);
            generateShowTable(shows);
        }
    }
    request.send();
}

function generateShowTable(shows) {
    showTable = document.getElementById('showTable');
    while (showTable.lastChild) {
        showTable.removeChild(showTable.lastChild);
    }
    addShowTableRow(showTable, 'ID', 'NAME', '');
    for (var i = 0; i < shows.length; i++) {
        var show = shows[i];
        addShowTableRow(showTable, show.id, show.name, '<button onclick=removeShow('+show.id+')>Remove</button>');
    }
}

function addShowTableRow(table, id, name, remove) {
    row = document.createElement('TR');
    idColumn = document.createElement('TD');
    nameColumn = document.createElement('TD');
    removeColumn = document.createElement('TD');
    idColumn.innerHTML = id;
    nameColumn.innerHTML = name;
    removeColumn.innerHTML = remove;
    row.appendChild(idColumn);
    row.appendChild(nameColumn);
    row.appendChild(removeColumn);
    showTable.appendChild(row);
}

function removeShow(id) {
    var request = new XMLHttpRequest();
    request.open('POST', '/removeShow');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            getShowList();
            getEpisodeList();
        }
    }
    request.send(id);
}

function getEpisodeList() {
    var request = new XMLHttpRequest();
    request.open('GET', '/episodeList');
    request.setRequestHeader('Content-type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            episodes = request.response;
            episodes = JSON.parse(episodes);
            generateEpisodeTable(episodes);
        }
    }
    request.send();
}

function generateEpisodeTable(episodes) {
    episodeTable = document.getElementById('episodeTable');
    while (episodeTable.lastChild) {
        episodeTable.removeChild(episodeTable.lastChild);
    }
    addEpisodeTableRow(episodeTable, 'DATE AIRED', 'SHOW NAME', 'SEASON', 'EPISODE #', 'EPISODE NAME', 'RECORDED', 'LINK'); 
    for (var i = 0; i < Object.keys(episodes).length; i++) {
        var episode = episodes[i];
        addEpisodeTableRow(episodeTable, episode.date_aired, episode.show_name, episode.season, episode.episode_num, episode.episode_name, episode.recorded, episode.url, episode.id);
    }
}

function addEpisodeTableRow(table, date_aired, show_name, season, episodeNum, episode_name, recorded, url, id) {
    row = document.createElement('TR');
    dateAiredColumn = document.createElement('TD');
    showNameColumn = document.createElement('TD');
    seasonColumn = document.createElement('TD');
    episodeNumColumn = document.createElement('TD');
    episodeNameColumn = document.createElement('TD');
    recordedColumn = document.createElement('TD');
    urlColumn = document.createElement('TD');

    dateAiredColumn.innerHTML = date_aired;
    showNameColumn.innerHTML = show_name;
    seasonColumn.innerHTML = season;
    episodeNumColumn.innerHTML = episodeNum;
    episodeNameColumn.innerHTML = episode_name;
    if (recorded != 'RECORDED') {
        recorded = '<input type="checkbox" onclick="setRecorded()" id=' + id + '></input>';
    }
    recordedColumn.innerHTML = recorded;
    if (url != 'LINK') {
        url = '<a href = ' + url + ' target = "_blank">Webpage</a>';
    }
    urlColumn.innerHTML = url;

    row.appendChild(dateAiredColumn);
    row.appendChild(showNameColumn);
    row.appendChild(seasonColumn);
    row.appendChild(episodeNumColumn);
    row.appendChild(episodeNameColumn);
    row.appendChild(recordedColumn);
    row.appendChild(urlColumn);
    table.appendChild(row);
}

function setRecorded(){
    id = document.activeElement.id;
    var x = confirm('Mark all earlier episodes as watched?')
    var request = new XMLHttpRequest();
    request.open('POST', '/setRecorded');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            getEpisodeList();
        }
    }
    request.send([id,x]);
}

function refreshEpisodes() {
    getShowList();
    getEpisodeList();
    var request = new XMLHttpRequest()
    request.open('GET', '/refreshEpisodes');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            getShowList();
            getEpisodeList();
        }
    }
    request.send();
}