var weather = (function(){
	'use strict';
	
	var _name = 'weather';

	var _timeOutRefresh = null;

	// De Bilt, Netherlands
	var _latitude = 52.1006502;
	var _longitude = 5.171758;
	var _data = {"coord":{"lon":5.28,"lat":52.7},"weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":"04d"}],"base":"stations","main":{"temp":16.21,"pressure":1022,"humidity":87,"temp_min":12,"temp_max":21.11},"visibility":10000,"wind":{"speed":6.7,"deg":360},"clouds":{"all":90},"dt":1465378214,"sys":{"type":1,"id":5213,"message":0.0434,"country":"NL","sunrise":1465355761,"sunset":1465416037},"id":2756076,"name":"Gemeente Enkhuizen","cod":200};
	
	var _iconTable = {
			"01d": "wi-day-sunny",
			"02d": "wi-day-cloudy",
			"03d": "wi-cloudy",
			"04d": "wi-cloudy-windy",
			"09d": "wi-showers",
			"10d": "wi-rain",
			"11d": "wi-thunderstorm",
			"13d": "wi-snow",
			"50d": "wi-fog",
			"01n": "wi-night-clear",
			"02n": "wi-night-cloudy",
			"03n": "wi-night-cloudy",
			"04n": "wi-night-cloudy",
			"09n": "wi-night-showers",
			"10n": "wi-night-rain",
			"11n": "wi-night-thunderstorm",
			"13n": "wi-night-snow",
			"50n": "wi-night-alt-cloudy-windy"
		};
		
	var _settings = {
		element: '#weather',
		url: 'http://api.openweathermap.org/data/2.5/weather?units={3}&lat={0}&lon={1}&appid={2}',
		account: config.weather.accounts[0].account,
		key: config.weather.accounts[0].token,
		dateFormat: 'HH:mm',
		units: 'metric',
		refresh: 15,
		debug: false
	};
	
	var _init = function(options){
		_settings = $.extend({}, _settings, options);
		_settings.element = $(_settings.element);
		_settings.debug = !_settings.debug? config.debug : _settings.debug;

		_settings.element.addClass('module refresh');
	};
	
	var _getGeoLocation = function(){
		navigator.geolocation.getCurrentPosition(_setGeoSuccess, _setGeoError);	
	};
	
	var _setGeoSuccess = function(geo){
		_latitude = geo.coords.latitude;
		_longitude = geo.coords.longitude;
		_onload();
	};
	
	var _setGeoError = function(geo){
		console.warn(_name.capitalize(), 'No location found');
		_onload();
	}
	
	var _createApiUrl = function(){
		_settings.url = _settings.url.format(_latitude, _longitude, _settings.key, _settings.units);
		//console.log(_settings.url);
	};
	
	var _getWeatherInfo = function(){	
		$.getJSON(_settings.url, 
		function(json){
			// Still the same data: don't refresh
			if(json.dt == _data.dt) return;
			
			_data = json;
			_createTable();
		},
		function(){
			console.warn(_name.capitalize(), 'No data found');
		});	
	};
	
	var _getDegreeIcon = function(degree){
		var icon = '';
		
		if(degree >= 350 && degree <= 10){
			icon = 'wi wi-wind-north';
		} else if(degree > 10 && degree < 80){
			icon = 'wi wi-wind-north-east';
		} else if(degree >= 80 && degree <= 100){
			icon = 'wi wi-wind-east';
		} else if(degree > 100 && degree < 170){
			icon = 'wi wi-wind-south-east';
		} else if(degree >= 170 && degree <= 190){
			icon = 'wi wi-wind-south';
		} else if(degree > 190 && degree < 260){
			icon = 'wi wi-wind-south-west';
		} else if(degree >= 260 && degree <= 280){
			icon = 'wi wi-wind-west';
		} else if(degree > 280 && degree < 350){
			icon = 'wi wi-wind-north-west';
		}
		return icon;
	};
	
	var _createTable = function(){
		sffjs.setCulture('nl-NL');
		
		var now = new Date();
		var sunrise = new Date(_data.sys.sunrise * 1000);
		var sunset = new Date(_data.sys.sunset * 1000);
		
		var sunriseSunsetTime = (sunrise < now && sunset > now) ? sunset : sunrise;
		var sunriseSunsetIcon = (sunrise < now && sunset > now) ? "wi wi-sunset" : "wi wi-sunrise";
		
		var currentSun = $('<h3>');
		var city = $('<span>').html(_data.name.replace('Gemeente','').trim());
		var	windSpeedIcon = $('<span class="wi wi-strong-wind"></span>');
		var	windSpeed = $('<span>').html(_data.wind.speed);
		var windDegreeIcon = $('<span>').addClass(_getDegreeIcon(_data.wind.deg));
		var	sunsetIcon = $('<span>').addClass(sunriseSunsetIcon);
		var	sunset = $('<span>').html(sunriseSunsetTime.format(_settings.dateFormat));
		
		var extra = $('<div class="extra">').append(windSpeedIcon).append(windSpeed).append(windDegreeIcon)
			currentSun.append(city).append(sunsetIcon).append(sunset).append(extra);
		
		var currentWeather = $('<h1>');
		var weatherIcon = $('<span>').addClass('wi ' + _iconTable[$(_data.weather).get(0).icon]);
		var units = (_settings.units == 'metric')? '&deg;' :'';
		
			currentWeather.append(weatherIcon).append(_data.main.temp.toFixed(1) + units);
		
		_settings.element.find('#sunset').html(currentSun);
		_settings.element.find('#temperature').html(currentWeather);
		
		console.log(_name.capitalize(), 'Last update', new Date(_data.dt * 1000).format('yyyy-MM-dd HH:mm'));		
	};
	
	var _onload = function(){
		_createApiUrl();
		_getWeatherInfo();
		_toggleRefresh(false);
		_setRefreshTimer();
	};
	
	var _refresh = function(){
		_setRefreshTimer();

		var date = new Date(_data.dt * 1000);
		var modelDate = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + _settings.refresh));
		var refreshDate = new Date();
		
		if( modelDate > refreshDate) return; 
	
		console.log(_name.capitalize(), 'Refresh', (new Date()).format('yyyy-MM-dd HH:mm'));

		window.clearTimeout(_timeOutRefresh);

		_toggleRefresh();
		_getGeoLocation();
	};

	var _toggleRefresh = function(state){
		if(typeof state !== 'undefined'){
			_settings.element.toggleClass('refresh', state);
		}else{
			_settings.element.toggleClass('refresh');
		}
	};

	var _setRefreshTimer = function(){
		window.clearTimeout(_timeOutRefresh);
		_timeOutRefresh = window.setTimeout(_refresh, (Math.round(_settings.refresh/3) * 60 * 1000));
	};

	return {
		name: _name,
		init: function(options){			
			_init(options);
		},
		start: function(){
			if(_settings.debug) {
				_createTable();
				_toggleRefresh(false);		
				return;
			}
			_getGeoLocation();
		},
		refresh: function(){
			_refresh();
		}
	};
}());