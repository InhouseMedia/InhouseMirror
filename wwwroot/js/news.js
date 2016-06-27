var news = (function(){
	'use strict';
	
	var _name = 'news';

	var _newsTimeout = null;
	var _data = null;
	var _counter = 0;
	var _toggleSpeed = 0;

	var _settings = {
		element: '#news',
		url: 'https://api.cognitive.microsoft.com/bing/v5.0/news{0}?count={1}&mkt={2}&setLang={3}&freshness={4}&headlineCount={1}',
		account: config.news.accounts[0].account,
		key: config.news.accounts[0].token,
		total: 10,
		type: '',
		age: 'Day',
		debug: false
	};

	var _init = function(options){
		_settings = $.extend({}, _settings, options);
		_settings.element = $(_settings.element);
		_settings.debug = !_settings.debug? config.debug : _settings.debug;

		_settings.element.addClass('module refresh');
	};

	var _createApiUrl = function(){
		var lang = config.locale.split('-').pop(); 
		_settings.url = _settings.url.format(
			_settings.type,
			_settings.total, 
			config.locale, 
			lang,
			_settings.age);

		console.log(_settings.url);	
	};

	var _getNews = function(){
		$.ajax({
			url: _settings.url,
			type: 'GET',
			contentType: 'application/json',
			crossDomain: true,
			headers: {
				'Ocp-Apim-Subscription-Key': _settings.key,
				'Content-Type': 'application/json'
			},
			dataType: 'json',
			success: function(json){
				// Still the same data: don't refresh
				if(_data !== null && $(json).get(0).datePublished == $(_data).get(0).datePublished) return;
				
				_data = json;
				_counter = 0;
				_sortNews();
				_showNews();
				_toggleRefresh(false);
				_switchNews();
			}
		});
	};

	var _sortNews = function(){
		_data.value = _.sortBy(_data.value, function(item){
			return item.datePublished;
		}).reverse();
	};

	var _showNews = function(){
		var item = $(_data.value).get(_counter);
		var modalDate = new Date() - new Date(item.datePublished);

		var date = modalDate > 3600000 ? Math.round(modalDate / 3600000) + ' uur geleden': Math.round(modalDate / 60000) + ' minuten geleden';
			date = modalDate < 120000 ? 'nu': date;

		var title = item.name.replace(/[\'\"\“\”\‘\’]/gm, '');
		var provider =  $(item.provider).get(0).name || '';

		var table = $('<table><tbody><tr><td>' + date + '</td></tr><tr><th><h3>' + title + '<span>' + provider + '</span></h3></th></tr></tbody></table>')
		
		_settings.element.html(table);
		
		if(_data.value.length-1 == _counter){
			_counter = 0;
			_refresh();
		}else{
			_counter++;
		}

		_toggleSpeed = title.split('_').length || 5;
	};

	var _switchNews = function(){
		window.clearTimeout(_newsTimeout);
		window.setTimeout(_toggleFader, _toggleSpeed * 9000 - 750);
		_newsTimeout = window.setTimeout(_showNews, _toggleSpeed * 9000);
		window.setTimeout(_toggleFader, _toggleSpeed * 9000 + 50);
		window.setTimeout(_switchNews, _toggleSpeed * 9000 + 51);
	};

	var _refresh = function(){
		if(_data.value.length/2 > _counter) _getNews();
	};
	
	var _toggleRefresh = function(state){
		if(typeof state !== 'undefined'){
			_settings.element.toggleClass('refresh', state);
		}else{
			_settings.element.toggleClass('refresh');
		}
	};

	var _toggleFader = function(){
		_settings.element.toggleClass('fader');
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
			_getNews();
		},
		refresh: function(){
			_refresh();
		}
	};
}());