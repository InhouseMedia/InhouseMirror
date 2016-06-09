var refresh = (function(){
	'use strict';
	
	var blurTimer = null;
	var compareTimer = null;
	
	var noCanvas = null;
	var noContext = null;
	var xvideo = null;
	var xstream = null;
	var xcanvas = null;
	var xcontext = null;
	
	var settings = {
		modules: [],
		motionDetection: true,
		blurTimer: (1000 * 20),
		snapRate: 800,
		sensitivity: 10,
		videoWidth: 640,
		videoHeight: 480,
		imageWidth: 64,
		imageHeight: 48,
		debug: false
	};
	
	var init = function(options){
		settings = $.extend({}, settings, options);
		settings.element = $(settings.element);
		settings.debug = !settings.debug? config.debug : settings.debug;
		//$(window).focus(function(){ location.reload(true); });
	
		noCanvas = $('<canvas>').attr({'width': settings.imageWidth, 'height': settings.imageHeight});
		noContext = noCanvas.get(0).getContext("2d");
	};
	
	var _register = function(mod){
		settings.modules.push(mod);
		
	};
	
	var createRefreshHeader = function(){
		var today = new Date();
		var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1,0,0,0,10);
		var refresh = Math.round((tomorrow - today)/1000);
		var meta = $('<meta>').attr({'http-equiv': 'refresh', 'content': refresh });
	
		meta.insertAfter($('head meta[charset]'));
		
		var refreshConsoleTime = (refresh/3600 > 1)? refresh/3600: refresh/60;
		var refreshConsoleType = (refresh/3600 > 1)? 'hours.': 'minutes.';
		console.log('Refresh page in', (refreshConsoleTime).toFixed(2), refreshConsoleType);
	};
	
	var setBlurTimer = function(){
		if(!settings.motionDetection) return;
		blurTimer = window.setTimeout(blur,settings.blurTimer);
	};
	
	var createMotionDetection = function(){
		var video = $('<video>').attr({'autoplay': true, 'id': 'motion', 'width': settings.videoWidth, 'height': settings.videoHeight});
			video.click(compareImages);
		
		xvideo = video.get(0);
		if(settings.debug) $('body').append(video);
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
	
	var createCanvas = function(){
		xcanvas = $('<canvas>').attr({'id':'canvas', 'width': settings.imageWidth, 'height': settings.imageHeight});
		
		xcontext = xcanvas.get(0).getContext("2d");
		
		if(settings.debug) $('body').append(xcanvas);
	};
	
	var captureImage = function(){
		noContext.drawImage(xvideo, 0, 0, settings.videoWidth, settings.videoHeight, 0, 0 , settings.imageWidth, settings.imageHeight);
			
		var imageData = noContext.getImageData(0, 0, settings.imageWidth, settings.imageHeight);
        var data = imageData.data;
/*
        for(var i = 0; i < data.length; i += 4) {
          var brightness = (data[i] + data[i+1] + data[i+2])/3; //Grayscale image
          data[i] = brightness; //Red
          data[i+1] = brightness; //Green
          data[i+2] = brightness; //Blue
        }*/
		return data;
	};
	
	var compareImages = function(){
		var image1 = captureImage();
		var image2;
		var diff;
		window.setTimeout(function(){	
			image2 = captureImage();
			diff = diffImage(image1,image2);
			xcontext.putImageData(diff.imageData, 0,0);
		
			//testing
			if(settings.debug) {
				$(xcanvas).css({'border': '1px solid ' + ((diff.procent >= settings.sensitivity)? 'red' : 'transparent')});
				$(xvideo).css({'border': '1px solid ' + ((diff.procent >= settings.sensitivity)? 'red' : 'transparent')});
			} 
			
			if(diff.procent >= settings.sensitivity){	
				if($('body').hasClass('loading')){
					//window.location.reload(false);
					focus();
					settings.modules.forEach(function(item){item.refresh();});
				}
				console.log('motion trigger', diff.procent, '%');
				window.clearTimeout(blurTimer);
				blurTimer = window.setTimeout(blur, settings.blurTimer);
			}
			
		},settings.snapRate);	
		
		compareTimer = window.setTimeout(compareImages,settings.snapRate)
	};
	
	var diffImage = function(image1,image2){
		var imageData = noContext.getImageData(0, 0, settings.imageWidth, settings.imageHeight);
        var data = imageData.data;
		var count = 0;
		for(var i = 0; i < image1.length; i += 4) {
		  var brightnessImage1 = (image1[i] + image1[i+1] + image1[i+2])/3;
		  var brightnessImage2 = (image2[i] + image2[i+1] + image2[i+2])/3;
		  var brightness = Math.abs(brightnessImage1 - brightnessImage2) > 30 ?255: 0;
		  
		  data[i] = brightness; //Red
          data[i+1] = brightness; //Green
          data[i+2] = brightness; //Blue
		  
		  count+= brightness > 0 ? 1: 0;
        }
		
		var procent = Math.round(count/(image1.length/4) * 100);
		if(settings.debug) console.log(procent + '%');
		return {imageData: imageData, procent: procent};
	};
	
	var focus = function(){
		$('body.loading').removeClass('loading');
	};
	
	var blur = function(){
		$('body').addClass('loading');
	};
	
	return {
		init: function(options){	
			init(options);
			createRefreshHeader();
			setBlurTimer();
		},
		focus: function(){
			focus();
		},
		blur: function(){
			blur();
		},
		motion: function(){
			if(!settings.motionDetection) return;
			
			createMotionDetection();
			startMotionDetection();
			createCanvas();
			compareImages();
		},
		start: function(){
			startMotionDetection();
			compareImages();
		},
		stop: function(){
			if(xstream.active){
				window.clearTimeout(compareTimer);
				xstream.getTracks()[0].stop();	
			} 
		},
		register: function(mod){
			_register(mod);
			
		},
		unregister: function(module){
			var index = settings.modules.indexOf(module);
			settings.modules.splice(index,1);
		}
		
	};
}())