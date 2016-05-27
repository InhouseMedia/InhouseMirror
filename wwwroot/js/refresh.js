var refresh = (function(){
	'use strict';
	
	var xvideo = null;
	var xstream = null;
	
	var init = function(){
		//$(window).focus(function(){ location.reload(true); });
	};
	
	var createRefreshHeader = function(){
		var today = new Date();
		var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1,0,0,0,10);
		
		var meta = $('<meta>').attr({'http-equiv': 'refresh', 'content': tomorrow - today});
	
		meta.insertAfter($('head meta[charset]'));
	};
	
	var createMotionDetection = function(){
		
		var video = $('<video>').attr({'autoplay': true, 'id': 'motion', 'width': 640, 'height': 480});
		$('body').append(video);
		xvideo = video.get(0);
	};
	
	var startMotionDetection = function(){
		var videoObj = {'video': true};
		
		navigator.getUserMedia = navigator.getUserMedia ||
                          		navigator.webkitGetUserMedia ||
                          		navigator.mozGetUserMedia ||
                         		navigator.msGetUserMedia;
						  
		navigator.getUserMedia(videoObj, function(stream){
				xvideo.src = window.URL.createObjectURL(stream);
				xvideo.play();
				xstream = stream;
		}.bind(this), function(e){console.log(e.code);});
	};
	
	var focus = function(){
		$('body.loading').removeClass('loading');
	};
	
	return {
		init: function(){
			init();
			createRefreshHeader();
		},
		focus: function(){
			focus();
		},
		motion: function(){
			createMotionDetection();
			startMotionDetection();
		},
		start: function(){
			startMotionDetection();
		},
		stop: function(){
			console.log(xstream.active);
			if(xstream.active) xstream.getTracks()[0].stop();
		},
	};
}())