var weather = (function(){
	'use strict';
	
	//var onloadTimeout = null;
	var weather = weather = '{"coord":{"lon":5.28,"lat":52.7},"weather":[{"id":701,"main":"Mist","description":"mist","icon":"50d"}],"base":"cmc stations","main":{"temp":294.65,"pressure":1012,"humidity":88,"temp_min":292.15,"temp_max":295.37},"wind":{"speed":3.6,"deg":50},"rain":{"3h":0.485},"clouds":{"all":20},"dt":1464714038,"sys":{"type":3,"id":5211,"message":0.0097,"country":"NL","sunrise":1464664864,"sunset":1464724386},"id":2756076,"name":"Gemeente Enkhuizen","cod":200}';
	
	// De Bilt, Netherlands
	var latitude = 52.1006502;
	var longitude = 5.171758;
	
	var settings = {
		element: '#weather',
		url: 'http://api.openweathermap.org/data/2.5/weather?lat={0}&lon={1}&appid={2}',
		account: config.weather.accounts[0].account,
		key: config.weather.accounts[0].token,
		debug: true
	};
	
	var init = function(options){
		settings = $.extend({}, settings, options);
		settings.element = $(settings.element);
		settings.debug = !settings.debug? config.debug : settings.debug;
			
		if(settings.debug) {
			 createTable();
			return;
		}
		
		getGeoLocation();
	};
	
	var getGeoLocation = function(){
		navigator.geolocation.getCurrentPosition(setGeoSuccess, setGeoError);	
	};
	
	var setGeoSuccess = function(geo){
		latitude = geo.coords.latitude;
		longitude = geo.coords.longitude;
		console.log(latitude, longitude);
		onload();
	};
	
	var setGeoError = function(geo){
		console.log('No location found');
		onload();
	}
	
	var createApiUrl = function(){
		settings.url = settings.url.format(latitude, longitude, settings.key);
		console.log(settings.url);
	};
	
	var getWeatherInfo = function(){	
		$.getJSON(settings.url, function(data){weather = data;});	
	};
	
	var createTable = function(){
		sffjs.setCulture('nl-NL');
		
		//var upcommingTbody = createRows(upcomming);
		//var pastTbody = createRows(past);
		var header = $('<thead><tr><th class="icon"></th><th></th><th></th></tr></thead>');
		var headerText = $('<tbody><tr><th colspan=3><h4>Historie</h4></th></tr></tbody>');
		
		var table = $('<table>');
			table.addClass('fader');
			table.append(header);
		//	table.append(upcommingTbody);
			table.append(headerText);
		//	table.append(pastTbody);
			
		settings.element.html(table);
	};
	
	var onload = function(){
		createApiUrl();
		getWeatherInfo();
		createTable();
	};
	/*
	var setOnload = function(){
		window.clearTimeout(onloadTimeout);
		onloadTimeout = window.setTimeout(onload, 300);
	};
	*/
	return {
		init: function(options){			
			init(options);
		},
	};
}())