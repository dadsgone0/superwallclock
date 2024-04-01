function updateClock() {
    var now = new Date();
    var localTime = now.getTime();
    var localOffset = now.getTimezoneOffset() * 60000;
    var utc = localTime + localOffset;
    var offset = -6;   // Time offset for CST
    var cst = utc + (3600000 * offset);
    var cstDate = new Date(cst);

    var hours = cstDate.getHours();
    var minutes = cstDate.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById('clock').innerHTML = hours + ":" + minutes + ' ' + ampm;

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var day = cstDate.getDate();
    var monthIndex = cstDate.getMonth();
    var year = cstDate.getFullYear();
    document.getElementById('date').innerHTML = monthNames[monthIndex] + ' ' + day + ', ' + year;
}
setInterval(updateClock, 1000);
updateClock();

function checkStatus() {
    var websites = ['https://www.frantic-software.com', 'https://satellitecdn.uk'];
    websites.forEach(function(website, index) {
        fetch(website)
            .then(function(response) {
                var status = response.status === 404 ? 'DOWN' : 'UP';
                var color = status === 'UP' ? 'green' : 'red';
                document.getElementById('status' + (index + 1)).innerHTML = website + ': <br> <span style="color:' + color + ';">' + status + '</span>';
            })
            .catch(function(error) {
                document.getElementById('status' + (index + 1)).innerHTML = website + ': <span style="color:red;">DOWN</span>';
            });
    });
}
setInterval(checkStatus, 900000); // Check every 15 minutes
checkStatus();


function updateWeather() {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Shakopee,us&units=imperial&appid=yourappidhere')
        .then(response => response.json())
        .then(data => {
            var temp = data.main.temp;
            var desc = data.weather[0].description;
            document.getElementById('weather').innerHTML = 'Weather in Shakopee, MN: ' + desc + ', ' + temp + ' degrees fahrenheit';
        });
}
setInterval(updateWeather, 1800000);
updateWeather();

var client_id = ''; // Your client id
var client_secret = ''; // Your secret
var refresh_token = ''; // Your refresh token
var access_token = null;

function refreshToken() {
    return new Promise((resolve, reject) => {
        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
            },
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                access_token = data.access_token;
                resolve(access_token);
            } else {
                reject('Failed to refresh token');
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

function updateSpotify() {
    if (access_token) {
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': 'Bearer ' + access_token }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.is_playing) {
                var track = data.item;
                var artist = track.artists[0].name;
                var song = track.name;
                var album = track.album.name;
                var albumCoverUrl = track.album.images[0].url;
        
                // Add ellipsis if the length exceeds 15 characters
                artist = artist.length > 15 ? artist.substring(0, 15) + '...' : artist;
                song = song.length > 15 ? song.substring(0, 15) + '...' : song;
                album = album.length > 15 ? album.substring(0, 15) + '...' : album;
        
                document.getElementById('spotify').innerHTML = 
                  'Now Playing<br>' +
                  '<span style="font-size: 2em;">' + song + '</span><br>' +
                  '<span style="font-size: 1.5em; color: gray;">' + artist + '</span><br>' +
                  '<span style="font-size: 1.5em; color: gray;">' + album + '</span><br>' +
                  '<img src="' + albumCoverUrl + '" width="350">';
              } else {
                document.getElementById('spotify').innerHTML = '<i style="color: gray;">No song playing...</i>';
              }
            })
        .catch(error => console.error('Error:', error));
    }
}

setInterval(refreshToken, 3600000); // Refresh the token every hour
setInterval(updateSpotify, 5000); // Update Spotify every 5 seconds
refreshToken().then(updateSpotify);



