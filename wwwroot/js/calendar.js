var calendar = (function(){
	'use strict';
	
	var _name = 'calendar';

	var events = [];
	var upcomming = [];
	var past = [];
	
	var timeOutPlaySound = null;
	var timeOutRefresh = null;
	var timeOutRefreshFadeOut = null;
	var timeOutRefreshFadeIn = null;
	var timeOutRefreshToggle = null;
	
	var timeOutSwitch = null;
	var timeOutSwitchFadeOut = null;
	var timeOutSwitchFadeIn = null;	
	var timeOutSwitchToggle = null;
	
	var onloadTimeout = null;
	
	var refresh = 0;
	var audio = $('<audio>');
	
	var timeMin = function(){	
		var x = new Date();
			x.setDate(x.getDate() - 17); 
		return x.toISOString();
	};
		
	var timeMax = function(){
		var x = new Date();
			x.setDate(x.getDate() + 17); 
		return x.toISOString();
	};
	
	var today = function(){
		var now = new Date();
		return new Date(now.getYear(), now.getMonth(), now.getDay());
	};
	
	var settings = {
		element: '#calendar',
		url: 'https://www.googleapis.com/calendar/v3/calendars/{0}/events/',
		account: config.calendar.accounts[0].account,
		key: config.calendar.accounts[0].token,
		alwaysIncludeEmail: false,
		showDeleted: false,
		timeMin: timeMin(),
		timeMax: timeMax(),
		upcommingEvents: 10,
		pastEvents: 10,
		dateFormat: 'dd MMMM',
		blinkSpeed: 5000,
		sound: 'sounds/beep.mp3',
		debug: false
	};
	
	var init = function(options){
		settings = $.extend({}, settings, options);
		settings.element = $(settings.element);
		settings.debug = !settings.debug? config.debug : settings.debug;
	};
	
	var createApiUrl = function(){
		var filterSettings = _.omit(settings,['url', 'account', 'upcommingEvents', 'pastEvents', 'element', 'dateFormat', 'sort']);
		
		settings.url = settings.url.format(settings.account);	
		settings.url+= '?' + $.param(filterSettings);
		//console.log(settings.url);
	};
	
	var getEvents = function(){
		events = [];
		upcomming = [];
		past = [];
		
		$.getJSON(settings.url, function(data){
			addEventsToList(data.items);
			setOnload();
			getRecurringEvents();
		});	
	};
	
	var getRecurringEvents = function(){
		events.forEach(function(item){
			if(!item.recurrence) return;
			
			events = _.without(events, item);
			
			var recurrenceUrl = settings.url.replace('/events/', '/events/' + item.recurrence + '/instances')
			//console.log(recurrenceUrl);
			$.getJSON(recurrenceUrl, function(data){
				addEventsToList(data.items);
				setOnload();
			});
		});	
	};
	
	var addEventsToList = function(items){
		items.forEach(function(item){
			var event = {
				title: item.summary.replace(/[❤️]/gm, '') || '',
				startDate: new Date(item.start.date || item.start.dateTime),
				endDate: new Date(item.end.date || item.end.dateTime),
				location: item.location || null,
				recurrence: (item.recurrence)? item.id: null
			}
			events.push(event);
		});	
	};
	
	var sortEventsList = function(){
		// Filter all upcomming events
		upcomming = _.filter(events, function(item){
			return (item.startDate >= new Date() || item.endDate >= new Date());
		});
		// Sort upcomming events and show only max results
		upcomming = _.sortBy(upcomming, function(item){
			return item.startDate;
		}).filter(function(item, index){
			return index < settings.upcommingEvents;
		});
		// Filter past evenst
		past = _.filter(events, function(item){
			return (item.startDate < new Date() && item.endDate < new Date());
		});
		// Sort past events and show only max results
		past = _.sortBy(past, function(item){
			return item.startDate;
		}).reverse().filter(function(item, index){
			return index < settings.pastEvents;
		});
	};
	
	var createTable = function(){
		sffjs.setCulture('nl-NL');
		
		var upcommingTbody = createRows(upcomming);
		var pastTbody = createRows(past);
		var header = $('<thead><tr><th class="icon"></th><th></th><th></th></tr></thead>');
		var headerText = $('<tbody><tr><th colspan=3><h4>Historie</h4></th></tr></tbody>');
		
		var table = $('<table>');
			table.addClass('fader');
			table.addClass('gradient');
			table.append(header);
			table.append(upcommingTbody);
			table.append(headerText);
			table.append(pastTbody);
			
		settings.element.html(table);
	};
	
	var createRows = function(items){
		var tbody = $('<tbody>');
		
		items.forEach(function(item){
			var diffDate = createDaysNotation(item);
			var currDate = item.startDate.format(settings.dateFormat);
			
			var icon = $('<td class="glyphicon glyphicon-calendar">');
			var title = $('<th>').html(item.title);
			var date = $('<td class="right">').html(currDate);
				date.attr({'data-diff': diffDate, 'data-date': currDate});
			var row = $('<tr>').append(icon).append(title).append(date);
			tbody.append(row);
		});
		return tbody;
	};
	
	var createDaysNotation = function(event){
		var startDate = event.startDate;
		var endDate = event.endDate;
		var now = new Date();
		var diffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		var diffNow = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		
		var days = dateDiff(diffDate, diffNow).d;
	
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
	
	var switchDate = function(){
		if(settings.blinkSpeed > 0){
			window.clearTimeout(timeOutSwitch);
			window.clearTimeout(timeOutSwitchFadeOut);
			window.clearTimeout(timeOutSwitchFadeIn);
			window.clearTimeout(timeOutSwitchToggle);
			
			timeOutSwitchFadeOut = window.setTimeout(toggleFader.bind('fadeOutSwitch','td[data-date]'), settings.blinkSpeed - 750);
			timeOutSwitch = window.setTimeout(toggleDate, settings.blinkSpeed);
			timeOutSwitchFadeIn = window.setTimeout(toggleFader.bind('fadeInSwitch','td[data-date]'), settings.blinkSpeed + 50);
			timeOutSwitchToggle = window.setTimeout(switchDate, settings.blinkSpeed + 51);
		}
	};
	
	var toggleDate = function(){
		settings.element.find('td[data-date]').each(function(id,item){
			item = $(item);
			var currDate = item.attr('data-date');
			var diffDate = item.attr('data-diff');
			var newDate = (currDate == item.html())? diffDate : currDate;
			item.html(newDate);
		});
	};
	
	var refreshEvents = function(){
		var now = new Date();
		var x = _.map(upcomming, function(item){
			return (now < item.startDate)? item.startDate - now : item.endDate - now;
		});
		
		var refreshList = _.sortBy(x, function(item){return item});
		refresh = $(refreshList).get(0) || 5000;
		
		var refreshConsoleTime = (refresh/60000 > 60)? refresh/3600000: refresh/60000;
		var refreshConsoleType = (refresh/60000 > 60)? 'hours.': 'minutes.';
		console.log('Refresh calendar in', (refreshConsoleTime).toFixed(2), refreshConsoleType);
		
		window.clearTimeout(timeOutPlaySound);
		window.clearTimeout(timeOutRefreshFadeOut);
		window.clearTimeout(timeOutRefresh);
		
		timeOutPlaySound = window.setTimeout(playSound, refresh - 1000);
		timeOutRefreshFadeOut = window.setTimeout(toggleFader.bind('fadeOutTable', 'table'), refresh - 1000);
		timeOutRefresh = window.setTimeout(getEvents, refresh);
	};
	
	var showEvents = function(){
		window.clearTimeout(timeOutRefreshToggle);
		window.clearTimeout(timeOutRefreshFadeIn);
		timeOutRefreshFadeIn = window.setTimeout(toggleFader.bind('fadeInTable','table'), 10);
		timeOutRefreshToggle = window.setTimeout(refreshEvents, 11);
	};
	
	var toggleFader = function(type){
		settings.element.find(type).toggleClass('fader');
	};
	
	var dateDiff = function(str1, str2){
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

	var setSound = function(){
		if(settings.sound == '') return;
		
		audio.attr({'src': settings.sound, 'autostart':false, 'id':'sound'});
		$('body').append(audio);
	};
	
	var playSound = function(){
		audio.get(0).play();
	};
	
	var onload = function(){
		sortEventsList();
		createTable();
		switchDate();
		showEvents();
	};
	
	var setOnload = function(){
		window.clearTimeout(onloadTimeout);
		onloadTimeout = window.setTimeout(onload, 300);
	};
	
	return {
		name: _name,
		init: function(options){
			init(options);
		},
		start: function(){
			createApiUrl();
			setSound();
			getEvents();
		},
		refresh: function(){
			refreshEvents();
		}
	};
})();