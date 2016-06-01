var timer = (function(){
	'use strict';
	
	var timeOutTime = 0;
	var timeOutDate = 0;
	
	var settings = {
		timeFormat: 'h:mm tt',
		timeElement: '#time',
		dateFormat: 'dddd, d MMMM yyyy',
		dateElement: '#date',
		blink: true,
		fade: true
	};
	
	var init = function(options){
		settings = $.extend({}, settings, options);
		settings.timeElement = $(settings.timeElement);
		settings.dateElement = $(settings.dateElement);
			
		var fade = (settings.fade)? 'fader': ''; 
		settings.timeElement.addClass(fade);
		settings.dateElement.addClass(fade);
	};
	
	var setTime = function(){
		sffjs.setCulture('en-US');
		var format = (settings.blink)? settings.timeFormat.replace(':','\\<\\b>:\\<\\/\\b\\>'): settings.timeFormat;
		var now = new Date();	
		var time = now.format(format);
		var duration = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()+1) - new Date(); //30000;
		settings.timeElement.html(time);
	
		timeOutTime = window.setTimeout(setTime, duration);
	}
	
	var setDate = function(){
		sffjs.setCulture('nl-NL');
		var today = new Date();	
		var date = today.format(settings.dateFormat);
		var duration = ((new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1,0,0,100))- today);
		settings.dateElement.html(date);
		
		timeOutDate = window.setTimeout(setDate, duration);
	};
	
	return {
		init: function(options){
			init(options);
			setTime();
			setDate();
		},		
		stop: function(){
			window.clearTimeout(timeOutTime);
			window.clearTimeout(timeOutDate);
		}
	};
})();