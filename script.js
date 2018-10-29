var key = "631763d4d96d73c51722b39c94168cf0";

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

document.addEventListener('DOMContentLoaded', function() {
    var loc = navigator.geolocation.getCurrentPosition(getCoords, error, options);
}, false);

function getCoords(position){
	var roundedCoords = {
		lat: position.coords.latitude,
		lon: position.coords.longitude
	}
	getWeather({coords: roundedCoords}, console.log);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}


function getWeather(location, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        //if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    var params = "";
    if(location.hasOwnProperty("city")) params = `q=${location.city}`; 
    else if (location.hasOwnProperty("coords")) params = `lat=${location.coords.lat}&lon=${location.coords.lon} `;
    console.log(params);
    xmlHttp.open("GET", `http://api.openweathermap.org/data/2.5/weather?${params}&appid=${key}`, true);
    xmlHttp.send(null);
}