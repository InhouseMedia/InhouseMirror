var weatherforecast = (function(){
	'use strict';
	
	var _name = 'weatherforecast';

	var _timeOutRefresh = null;

	// De Bilt, Netherlands
	var _latitude = 52.1006502;
	var _longitude = 5.171758;
	var _data = {"city":{"id":2756076,"name":"Gemeente Enkhuizen","coord":{"lon":5.28333,"lat":52.700001},"country":"NL","population":0},"cod":"200","message":0.0531,"cnt":7,"list":[{"dt":1465815600,"temp":{"day":18.24,"min":12.19,"max":18.67,"night":12.19,"eve":15.11,"morn":18.67},"pressure":1013.89,"humidity":100,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":2.97,"deg":349,"clouds":76,"rain":4.15},{"dt":1465902000,"temp":{"day":15.9,"min":13.33,"max":15.9,"night":13.91,"eve":14.96,"morn":13.33},"pressure":1011.28,"humidity":100,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":2.72,"deg":212,"clouds":80,"rain":2.78},{"dt":1465988400,"temp":{"day":15.45,"min":11.66,"max":15.45,"night":11.66,"eve":15.16,"morn":14.21},"pressure":1012.51,"humidity":98,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":4.81,"deg":215,"clouds":80},{"dt":1466074800,"temp":{"day":14.79,"min":14.61,"max":15.04,"night":14.83,"eve":15.04,"morn":14.61},"pressure":1014.01,"humidity":0,"weather":[{"id":502,"main":"Rain","description":"heavy intensity rain","icon":"10d"}],"speed":5.34,"deg":338,"clouds":98,"rain":28.08},{"dt":1466161200,"temp":{"day":15.92,"min":12.59,"max":15.92,"night":12.59,"eve":14.13,"morn":14.93},"pressure":1027.02,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":6.34,"deg":3,"clouds":26,"rain":1.59},{"dt":1466247600,"temp":{"day":14.17,"min":12.69,"max":14.26,"night":13.27,"eve":14.26,"morn":12.69},"pressure":1024.61,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":4.96,"deg":335,"clouds":31,"rain":1.23},{"dt":1466334000,"temp":{"day":15.45,"min":14.19,"max":15.46,"night":14.28,"eve":15.46,"morn":14.19},"pressure":1028.33,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":5.95,"deg":308,"clouds":94,"rain":1.61}]};
	
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
		element: '#weatherforecast',
		url: 'http://api.openweathermap.org/data/2.5/forecast/daily?units={3}&lat={0}&lon={1}&appid={2}',
		account: config.weather.accounts[0].account,
		key: config.weather.accounts[0].token,
		dateFormat: 'ddd',
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
			if(_.isEqual(json, _data)) return;
			
			_data = json;
			_createTable();
		},
		function(){
			console.warn(_name.capitalize(), 'No data found');
		});	
	};
	
	var _createTable = function(){
		sffjs.setCulture('nl-NL');
		
		var upcommingTbody = _createRows(_data.list);
		var header = $('<thead><tr><th></th><th class="icon"></th><th></th><th></th></tr></thead>');
		
		var table = $('<table>');
			table.addClass('fader');
			table.addClass('gradient');
			table.append(header);
			table.append(upcommingTbody);
		
		var items = $('<div>');
			items.append('<h4>Weerbericht</h4>');
			items.append(table);
		_settings.element.html(items);

		console.log(_name.capitalize(), 'Last update', new Date().format('yyyy-MM-dd HH:mm'));
	};
	
	var _createRows = function(items){
		var tbody = $('<tbody>');
		
		items.forEach(function(item){	
			var units = (_settings.units == 'metric')? '&deg;' :'';
			var currDate = (new Date(item.dt * 1000)).format(_settings.dateFormat);
			
			var date = $('<td>').html(currDate);
			var icon = $('<td>').addClass('highlight wi ' + _iconTable[$(item.weather).get(0).icon]);
			var maxTemp = $('<td>').addClass('highlight').html(item.temp.max.toFixed(1) + units);
			var minTemp = $('<td>').html(item.temp.min.toFixed(1) + units);
			
			var row = $('<tr>').append(date).append(icon).append(maxTemp).append(minTemp);
			tbody.append(row);
		});
		return tbody;
	};
	
	var _onload = function(){
		_createApiUrl();
		_getWeatherInfo();
		_toggleRefresh(false);
		_setRefreshTimer();
	};
	
	var _refresh = function(){
		_setRefreshTimer();

		var refreshDate = new Date();

		var xxx = _.map(_data.list, function(item){
			var refreshDate = new Date();
			var date = new Date(item.dt * 1000);
			var modelDate = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + _settings.refresh));
			//console.log(modelDate.getDate(), refreshDate.getDate(), modelDate, refreshDate);
			return (refreshDate.getDate() == date.getDate() && modelDate > refreshDate);
		});
		
		if(_.contains(true,xxx)) return; 

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
				_toggleRefresh();
				return;
			}
			_getGeoLocation();
		},
		refresh: function(){
			_refresh();
		}
	};
}());