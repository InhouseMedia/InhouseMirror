var calendar = (function(){
	'use strict';
	
	var _name = 'calendar';

	var _timeOutRefresh = null;
	var _data = {"updated": "2016-06-22T10:00:00"};

	var _events = [];
	var _upcomming = [];
	var _past = [];
	var _oldUpcomming = [];
	
	var _timeOutSwitch = null;
	var _timeOutSwitchFadeOut = null;
	var _timeOutSwitchFadeIn = null;	
	var _timeOutSwitchToggle = null;
	
	var _onloadTimeout = null;
	
	var _refreshMoment = 0;
	var _audio = $('<audio>');
	
	var _timeMin = function(){	
		var x = new Date();
			x.setDate(x.getDate() - 17); 
		return x.toISOString();
	};
		
	var _timeMax = function(){
		var x = new Date();
			x.setDate(x.getDate() + 17); 
		return x.toISOString();
	};
	
	var _settings = {
		element: '#calendar',
		url: 'https://www.googleapis.com/calendar/v3/calendars/{0}/events/',
		account: config.calendar.accounts[0].account,
		key: config.calendar.accounts[0].token,
		alwaysIncludeEmail: false,
		showDeleted: false,
		timeMin: _timeMin(),
		timeMax: _timeMax(),
		upcommingEvents: 10,
		pastEvents: 10,
		dateFormat: 'dd MMMM',
		blinkSpeed: 5000,
		refresh: 10,
		sound: 'sounds/beep.mp3',
		debug: false
	};
	
	var _init = function(options){
		_settings = $.extend({}, _settings, options);
		_settings.element = $(_settings.element);
		_settings.debug = !_settings.debug? config.debug : _settings.debug;

		_settings.element.addClass('module refresh');

		_refreshMoment = _settings.refresh;
	};
	
	var _createApiUrl = function(){
		var filter_Settings = _.omit(_settings,['url', 'account', 'refresh', 'upcommingEvents', 'pastEvents', 'element', 'dateFormat', 'sort', 'sound', 'debug', 'blinkSpeed']);
		
		_settings.url = _settings.url.format(_settings.account);	
		_settings.url+= '?' + $.param(filter_Settings);
		//console.log(_settings.url);
	};
	
	var _getEvents = function(){
		_events = [];
		_upcomming = [];
		_past = [];
		
		$.getJSON(_settings.url, function(json){
			
			_data = json;

			_addEventsToList(json.items);
			_setOnload();
			_getRecurringEvents();
		});	
	};
	
	var _getRecurringEvents = function(){
		_events.forEach(function(item){
			if(!item.recurrence) return;
			
			_events = _.without(_events, item);
			
			var recurrenceUrl = _settings.url.replace('/events/', '/events/' + item.recurrence + '/instances')
			//console.log(recurrenceUrl);
			$.getJSON(recurrenceUrl, function(json){
				_addEventsToList(json.items);
				_setOnload();
			});
		});	
	};
	
	var _addEventsToList = function(items){
		items.forEach(function(item){
			var event = {
				title: item.summary.replace(/[❤️]/gm, '') || '',
				startDate: new Date(item.start.date || item.start.dateTime),
				endDate: new Date(item.end.date || item.end.dateTime),
				location: item.location || null,
				recurrence: (item.recurrence)? item.id: null
			}
			_events.push(event);
		});	
	};
	
	var _sortEventsList = function(){
		// Filter all upcomming events
		_upcomming = _.filter(_events, function(item){
			return (item.startDate >= new Date() || item.endDate >= new Date());
		});
		// Sort upcomming events and show only max results
		_upcomming = _.sortBy(_upcomming, function(item){
			return item.startDate;
		}).filter(function(item, index){
			return index < _settings.upcommingEvents;
		});
		// Filter past evenst
		_past = _.filter(_events, function(item){
			return (item.startDate < new Date() && item.endDate < new Date());
		});
		// Sort past events and show only max results
		_past = _.sortBy(_past, function(item){
			return item.startDate;
		}).reverse().filter(function(item, index){
			return index < _settings.pastEvents;
		});
	};
	
	var _createTable = function(){
		sffjs.setCulture('nl-NL');
		
		var upcommingTbody = _createRows(_upcomming);
		var pastTbody = _createRows(_past, 'past');
		var header = $('<thead><tr><th class="icon"></th><th></th><th></th></tr></thead>');
		var headerText = $('<tbody class="past"><tr><th colspan=3><h4>Historie</h4></th></tr></tbody>');
		
		var table = $('<table>');
			table.addClass('fader');
			table.addClass('gradient');
			table.append(header);
			table.append(upcommingTbody);
			table.append(headerText);
			table.append(pastTbody);
			
		_settings.element.html(table);
	};
	
	var _createRows = function(items, name){
		var className = name || '';
		var tbody = $('<tbody class="' + className + '">');
		
		items.forEach(function(item){
			var diffDate = _createDaysNotation(item);
			var currDate = item.startDate.format(_settings.dateFormat);
			
			var icon = $('<td class="glyphicon glyphicon-calendar">');
			var title = $('<th>').html(item.title);
			var date = $('<td class="right">').html(currDate);
				date.attr({'data-diff': diffDate, 'data-date': currDate});
			var row = $('<tr>').append(icon).append(title).append(date);
			tbody.append(row);
		});
		return tbody;
	};
	
	var _createDaysNotation = function(event){
		var startDate = event.startDate;
		var endDate = event.endDate;
		var now = new Date();
		var diffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		var diffNow = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		
		var days = _dateDiff(diffDate, diffNow).d;
	
		if(now >= startDate && now < endDate){
			return "<span>Nu</span>";
		}else if(days == 0 && (now < startDate || now >= endDate)){
			return "Vandaag";
		}else if(days == 1){
			return "Morgen";
		}else if(days == -1){
			return "Gister";	
		}else if(days > 0){
			return days + " dgn.";
		}else if(days < 0){
			return Math.abs(days) + " dgn. gldn.";
		}
	};
	
	var _switchDate = function(){
		if(_settings.blinkSpeed > 0){
			window.clearTimeout(_timeOutSwitch);
			window.clearTimeout(_timeOutSwitchFadeOut);
			window.clearTimeout(_timeOutSwitchFadeIn);
			window.clearTimeout(_timeOutSwitchToggle);
			
			_timeOutSwitchFadeOut = window.setTimeout(_toggleFader.bind('fadeOutSwitch','td[data-date]'), _settings.blinkSpeed - 750);
			_timeOutSwitch = window.setTimeout(_toggleDate, _settings.blinkSpeed);
			_timeOutSwitchFadeIn = window.setTimeout(_toggleFader.bind('fadeInSwitch','td[data-date]'), _settings.blinkSpeed + 50);
			_timeOutSwitchToggle = window.setTimeout(_switchDate, _settings.blinkSpeed + 51);
		}
	};
	
	var _toggleDate = function(){
		_settings.element.find('td[data-date]').each(function(id,item){
			item = $(item);
			var currDate = item.attr('data-date');
			var diffDate = item.attr('data-diff');
			var newDate = (currDate == item.html())? diffDate : currDate;
			item.html(newDate);
		});
	};
	
	var _toggleFader = function(type){
		_settings.element.find(type).toggleClass('fader');
	};

	var _refreshEvents = function(){
		var now = new Date();
		var x = _.map(_upcomming, function(item){
			return (now < item.startDate)? item.startDate - now : item.endDate - now;
		});
		
		var refreshList = _.sortBy(x, function(item){return item});
		_refreshMoment = Math.min(($(refreshList).get(0)/60000).round(2), _settings.refresh);

		var refreshConsoleTime = (_refreshMoment > 60)? _refreshMoment/60: _refreshMoment;
		var refreshConsoleType = (_refreshMoment > 60)? 'hours.': 'minutes.';
		console.log('Refresh calendar in', (refreshConsoleTime).toFixed(2), refreshConsoleType);
		
		_data.updated = now.toString();
	};
	
	var _dateDiff = function(str1, str2){
	    var diff = Date.parse(str2) - Date.parse(str1); 
    	return isNaN(diff)? NaN : {
			diff : diff,
			ms : Math.floor( diff            % 1000 ),
			s  : Math.floor( diff /     1000 %   60 ),
			m  : Math.floor( diff /    60000 %   60 ),
			h  : Math.floor( diff /  3600000 %   24 ),
			d  : Math.floor( diff / 86400000        )
		};
	};

	var _setSound = function(){
		if(_settings.sound == '') return;
		
		_audio.attr({'src': _settings.sound, 'autostart':false});
	};
	
	var _playSound = function(){
		_audio.get(0).play();
	};
	
	var _onload = function(){
		_sortEventsList();
		_createTable();
		
		if(_settings.blinkSpeed > 0){
			_toggleDate();
			_switchDate();
		}
		
		_toggleRefresh(false);
		_refreshEvents();
		_setRefreshTimer();
		_playSound();
	};

	var _setOnload = function(){
		window.clearTimeout(_onloadTimeout);
		_onloadTimeout = window.setTimeout(_onload, 300);
	};

	var _refresh = function(){
		_setRefreshTimer();
		_oldUpcomming = _upcomming;

		var date = new Date(_data.updated);
		var modelDate = (new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + _refreshMoment));
		var refreshDate = new Date();
		 //console.log('-----', date, modelDate, refreshDate, modelDate, refreshDate);
		if(modelDate > refreshDate) return; 
	
		console.log(_name.capitalize(), 'Refresh', (new Date()).format('yyyy-MM-dd HH:mm'));

		window.clearTimeout(_timeOutRefresh);

		//_refreshEvents();
		_toggleRefresh();
		_getEvents();
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
		_timeOutRefresh = window.setTimeout(_refresh, (_refreshMoment) * 60 * 1000);
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

			_createApiUrl();
			_setSound();
			_getEvents();
		},
		refresh: function(){
			_refresh();
		}
	};
})();