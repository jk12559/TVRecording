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
    //var space = selection.indexOf(' ');
    //var selectedID = selection.slice(0, space);
    var request = new XMLHttpRequest();
    request.open('POST', '/addToDB');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            alert(selection + " added to the queue!");
        }
    }
    request.send(selection);
}