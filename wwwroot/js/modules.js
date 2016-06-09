var modules = (function(){
	'use strict';
	
	var _config = {
		modules:{}
	};
	
	var _init = function(){
		$('body').on('refresh', _refresh);
	};
	
	var _register = function(obj, settings){
		var item = {};
			item[obj.name] = obj;
			item[obj.name].init(settings);
		_config.modules = $.extend({}, _config.modules, item);
	};
	
	var _unregister = function(name){
		delete _config.modules[name];
	};

	var _start = function(){
		_.mapObject(_config.modules, function(item){item.start();});
	};
	
	var _refresh = function(event, name){
		if(name == null){
			_.mapObject(_config.modules, function(item){item.refresh();});
			return;
		}

		if(name && _config.modules.hasOwnProperty(name)){
			_config.modules[name].refresh();
			return;
		}
	};

	return {
		init: function(){
			_init();
		},
		start: function(){
			_start();
		},
		register: function(obj, settings){
			_register(obj, settings);
		},
		unregister: function(name){
			_unregister(name);
		},
		refresh: function(name){
			_refresh(null, name);
		}
	};
})();	