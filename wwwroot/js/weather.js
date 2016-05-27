var weather = (function(){
	'use strict';
	
	var settings = {
		element: '#weather',
		url: 'https://www.googleapis.com/calendar/v3/calendars/{0}/events/',
		account: config.account,
		key: config.token,
		alwaysIncludeEmail: false,
		showDeleted: false,
		upcommingEvents: 10,
		pastEvents: 10,
		dateFormat: 'dd MMMM',
		blinkSpeed: 5000
	};
	
	var init = function(){
		
	};
	

	
	return {
		init: function(options){
			settings = $.extend({}, settings, options);
			settings.element = $(settings.element);
			
			init();
		},
	};
}())