var refresh = (function(){
	'use strict';
	
	var init = function(){
		//$(window).focus(function(){ location.reload(true); });
		var today = new Date();
		var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1,0,0,0,10);
		
		var meta = $('<meta>').attr({'http-equiv': 'refresh', 'content': tomorrow - today});
	
		meta.insertAfter($('head meta[charset]'));
	};
	
	var focus = function(){
		$('body.loading').removeClass('loading');
	};
	
	return {
		init: function(){
			init();
		},
		focus: function(){
			focus();
		}
	};
}())