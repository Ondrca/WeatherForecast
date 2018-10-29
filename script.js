const API_KEY = "631763d4d96d73c51722b39c94168cf0";

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

var cover = document.getElementById("cover");

document.addEventListener('DOMContentLoaded', function() {
	cover.addEventListener("click", function(e){
		if(e.target == this)
			cover.className = "";  
	});
    var loc = navigator.geolocation.getCurrentPosition(getCoords, error, options);
}, false);

function getCoords(position){
	var roundedCoords = {
		lat: position.coords.latitude,
		lon: position.coords.longitude
	}
	getWeather({coords: roundedCoords}, function(arr){
		console.log(arr);
		setInputText(`${arr.city.name}, ${arr.city.country}`);
		var days = {};
		for (let i = 0; i < arr.list.length; i++) {
			let item = arr.list[i];
			let dateInText = getDateinText(item.dt_txt);
			if(!days.hasOwnProperty(dateInText)){
				days[dateInText] = {
					timestamp: [],
					weather: [],
					weather_icon: [],
					temp: [],
					temp_min: [],
					temp_max: [],
					pressure: []
				};
			}
			days[dateInText].timestamp.push(item.dt);
			days[dateInText].weather.push(item.weather[0].main);
			days[dateInText].weather_icon.push(item.weather[0].icon);
			days[dateInText].temp.push(item.main.temp);
			days[dateInText].temp_min.push(item.main.temp_min);
			days[dateInText].temp_max.push(item.main.temp_max);
			days[dateInText].pressure.push(item.main.pressure);
		}
		for(day in days){
			let obj = averageAll(days[day]);
			obj.date = day;
			console.log(obj);
			addItemToForecast(obj);
		}
	});
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  setInputText("You have to allow geolocation!");
}

function getDateinText(str){
	return str.substr(0,10);
}

function averageAll(obj){
	var r = {};
	for(key in obj){
		if(key !== "weather" && key !== "weather_icon")
			r[key] = average(obj[key]);
		else{
			if(key === "weather"){
				r[key] = mode(obj[key]);
				r["weather_icon"] = obj["weather_icon"][obj[key].indexOf(r[key])];
			}
		}
	}
	return r;
}

function average(arr){
	var sum, avg = 0;
	if (arr.length)
	{
	    sum = arr.reduce(function(a, b) { return a + b; });
	    avg = sum / arr.length;
	}
	return avg;
}

function getWeather(location, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
    	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    var params = "";
    if(location.hasOwnProperty("city")) params = `q=${location.city}`; 
    else if (location.hasOwnProperty("coords")) params = `lat=${location.coords.lat}&lon=${location.coords.lon}`;
    console.log(params);
    xmlHttp.open("GET", `http://api.openweathermap.org/data/2.5/forecast?${params}&appid=${API_KEY}`, true);
    xmlHttp.send(null);
}

function setInputText(text){
	document.getElementById("location").value = text;
}

var forecastWrapper = document.getElementById("forecast");

function addItemToForecast(obj){
	var short = {
		weather: obj.weather, //.join("/")
		temp: kelvinToCelsius(obj.temp),
	}
	var itemWrapper = createElementWithClass("div","forecast--item");
	itemWrapper.addEventListener("click", function(){
		showDetailedForecast(obj.date);
	});
	var itemHeading = createElementWithClass("h2", "", obj.date);
	itemWrapper.appendChild(itemHeading);
	for(key in short){
		if(key === "weather" || key === "icon"){
			let newItem = createElementWithClass("i", `wi ${getIcon(obj.weather_icon)}`);
			itemWrapper.appendChild(newItem);
		}
		let newItem = createElementWithClass("h3",key,short[key]);
		itemWrapper.appendChild(newItem);
	}
	forecastWrapper.appendChild(itemWrapper);
}

function createElementWithClass(tagName, className, content){
	className = className || "";
	var tag = document.createElement(tagName);
	tag.className = className;
	if(content){
		var t = document.createTextNode(content);
		tag.appendChild(t);
	}
	return tag;
}

function kelvinToCelsius(k) {
	return `${Math.round(k-273.15)} °C`;
}

function showDetailedForecast(date){
	cover.className = "visible";
}

function getIcon(weatherIcon){
	let key = `i${weatherIcon.substr(0, 2)}`;
	let i = weatherIcon.substr(-1) === "n" ? 0 : 1;

	var icons = {
		i01: ["day-sunny", "night-clear"],
		i02: ["day-cloudy", "night-alt-cloudy"],
		i03: ["cloud", "cloud"],
		i04: ["cloudy", "cloudy"],
		i09: ["rain", "rain"],
		i10: ["day-rain", "night-alt-rain"],
		i11: ["wi-thunderstorm", "wi-thunderstorm"],
		i13: ["wi-snow", "wi-snow"],
	};
	var r = `wi-${icons[key][i]}`;

	return r;
}

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}