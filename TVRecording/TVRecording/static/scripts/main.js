function start() {
    authenticate();
    getShowList();
    getEpisodeList();
}

function authenticate() {
    var request = new XMLHttpRequest();
    request.open("GET", "/authenticate");
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            token = request.responseText;
        }
    }
    request.send();
}

function getAddShowForm() {
    document.getElementById('searchShowForm').style.visibility = 'visible';
}

function search() {
    var searchText = document.getElementById('searchText').value;
    var request = new XMLHttpRequest();
    request.open('POST', '/showSearch');
    request.setRequestHeader('Content-type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            var results = request.response;
            displayResultsTable(results);
        }
    }
    var requestData = { 'search': searchText };
    request.send(JSON.stringify(requestData));
}

function displayResultsTable(data) {
    var resultsList = JSON.parse(data)['data'];
    var table = document.getElementById('searchResultsTable');
    var selection = document.getElementById('showSelection')
    var numRows = table.rows.length;

    for (var i = 1; i < numRows; i++) {
        table.deleteRow(1);
        selection.remove(0);
    }

    for (var i = 0; i < resultsList.length; i++) {
        var result = resultsList[i];
        var row = table.insertRow(-1);
        row.insertCell(-1).innerHTML = result['id'];
        row.insertCell(-1).innerHTML = result['seriesName'];
        row.insertCell(-1).innerHTML = result['network'];
        row.insertCell(-1).innerHTML = result['overview'];

        var option = document.createElement('option');
        option.text = result['id'] + " - " + result['seriesName'];
        selection.add(option);
    }
}

function addToDB() {
    var selection = document.getElementById('showSelection').value;
    var request = new XMLHttpRequest();
    request.open('POST', '/addToDB');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            getShowList();
            getEpisodeList();
        }
    }
    request.send(selection);
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
    addShowTableRow(showTable, 'ID', 'NAME');
    for (var i = 0; i < shows.length; i++) {
        var show = shows[i];
        addShowTableRow(showTable, show.id, show.name);
    }
}

function addShowTableRow(table, id, name) {
    row = document.createElement('TR');
    idColumn = document.createElement('TD');
    nameColumn = document.createElement('TD');
    idColumn.innerHTML = id;
    nameColumn.innerHTML = name;
    row.appendChild(idColumn);
    row.appendChild(nameColumn);
    showTable.appendChild(row);
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
    addEpisodeTableRow(episodeTable, 'DATE AIRED', 'SHOW NAME', 'SEASON', 'EPISODE #', 'EPISODE NAME', 'RECORDED'); 
    for (var i = 0; i < Object.keys(episodes).length; i++) {
        var episode = episodes[i];
        addEpisodeTableRow(episodeTable, episode.date_aired, episode.show_name, episode.season, episode.episode_num, episode.episode_name, episode.recorded, episode.id);
    }
}

function addEpisodeTableRow(table, date_aired, show_name, season, episodeNum, episode_name, recorded, id) {
    row = document.createElement('TR');
    dateAiredColumn = document.createElement('TD');
    showNameColumn = document.createElement('TD');
    seasonColumn = document.createElement('TD');
    episodeNumColumn = document.createElement('TD');
    episodeNameColumn = document.createElement('TD');
    recordedColumn = document.createElement('TD');

    dateAiredColumn.innerHTML = date_aired;
    showNameColumn.innerHTML = show_name;
    seasonColumn.innerHTML = season;
    episodeNumColumn.innerHTML = episodeNum;
    episodeNameColumn.innerHTML = episode_name;
    if (recorded != 'RECORDED') {
        recorded = '<input type="checkbox" onclick="setRecorded()" id=' + id + '></input>';
    }
    recordedColumn.innerHTML = recorded;

    row.appendChild(dateAiredColumn);
    row.appendChild(showNameColumn);
    row.appendChild(seasonColumn);
    row.appendChild(episodeNumColumn);
    row.appendChild(episodeNameColumn);
    row.appendChild(recordedColumn);
    table.appendChild(row);
}

function setRecorded(){
    id = document.activeElement.id;
    var request = new XMLHttpRequest();
    request.open('POST', '/setRecorded');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            getEpisodeList();
        }
    }
    request.send(id);
    //alert(id); //send id to episode table to set recorded flag to 1 and remove it from the table
}