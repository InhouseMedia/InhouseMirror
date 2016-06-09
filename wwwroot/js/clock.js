var clock = (function(){
	'use strict';
	
	var _name = 'clock';

	var _now = new Date();

	var _timeOutRefresh = null;
	var _timeOutTime = null;
	var _timeOutDate = null;
	
	var _settings = {
		element: '#clock',
		timeFormat: 'h:mm tt',
		timeElement: '#time',
		dateFormat: 'dddd, d MMMM yyyy',
		dateElement: '#date',
		blink: true,
		fade: true
	};
	
	var _init = function(options){
		_settings = $.extend({}, _settings, options);
		_settings.element = $(_settings.element);
			
		_settings.element.addClass('module');
		
		if(_settings.fade) _settings.element.addClass('fader');
	};
	
	var _setTime = function(){
		sffjs.setCulture('en-US');
		var format = (_settings.blink)? _settings.timeFormat.replace(':', '\\<\\b\\>:\\<\\/\\b\\>') : _settings.timeFormat;
		_now = new Date();
		var duration = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), _now.getHours(), _now.getMinutes()+1) - _now; //30000;
		var time = _now.format(format);

		_settings.element.find('#time').html(time);
		_timeOutTime = window.setTimeout(_setTime, duration);
	}
	
	var _setDate = function(){
		sffjs.setCulture('nl-NL');
		_now = new Date();	
		var duration = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + 1, 0, 0, 100) - _now;
		var date = _now.format(_settings.dateFormat);

		_settings.element.find('#date').html(date);
		_timeOutDate = window.setTimeout(_setDate, duration);
	};
	
	var _stop = function(){
		window.clearTimeout(_timeOutTime);
		window.clearTimeout(_timeOutDate);
	};
	
	var _refresh = function(){
			//Do not refresh when time & date are accurate
			var format = 'yyyy-MM-dd HH:mm';
			var modelDate = _now.format(format);
			var refreshDate = (new Date()).format(format);
			if( modelDate == refreshDate) return; 

			console.log(_name.capitalize(), 'Refresh');
			
			window.clearTimeout(_timeOutRefresh);
			
			_toggleRefresh();
			_setTime();
			_setDate();

			_timeOutRefresh = window.setTimeout(_toggleRefresh, 1000);
	};

	var _toggleRefresh = function(type){
		_settings.element.toggleClass('refresh');
	};
	
	return {
		name: _name,
		init: function(options){
			_init(options);
		},		
		start: function(){
			_setTime();
			_setDate();
		},
		stop: function(){
			_stop();
		},
		refresh: function(){
			_refresh();
		}
	};
})();