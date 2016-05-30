var refresh = (function(){
	'use strict';
	var blurTimer = null;
	
	var noCanvas = null;
	var noContext = null;
	var xvideo = null;
	var xstream = null;
	var xcanvas = null;
	var xcontext = null;
	
	var settings = {
		blurTimer: (1000*60),
		snapRate: 1000,
		sensitivity: 30,
		width: 640,
		height: 480,
		debug: false
	};
	
	var init = function(options){
		settings = $.extend({}, settings, options);
		settings.element = $(settings.element);
		//$(window).focus(function(){ location.reload(true); });
	
		noCanvas = $('<canvas>').attr({'width': settings.width, 'height': settings.height});
		noContext = noCanvas.get(0).getContext("2d");
	};
	
	var createRefreshHeader = function(){
		var today = new Date();
		var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1,0,0,0,10);
		
		var meta = $('<meta>').attr({'http-equiv': 'refresh', 'content': tomorrow - today});
	
		meta.insertAfter($('head meta[charset]'));
	};
	
	var setBlurTimer = function(){
		blurTimer = window.setTimeout(blur,settings.blurTimer);
	};
	
	var createMotionDetection = function(){
		var video = $('<video>').attr({'autoplay': true, 'id': 'motion', 'width': settings.width, 'height': settings.height});
			video.click(compareImages);
		
		xvideo = video.get(0);
		//if(settings.debug) $('body').append(video);
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
		xcanvas = $('<canvas>').attr({'id':'canvas', 'width': settings.width, 'height': settings.height});
		
		xcontext = xcanvas.get(0).getContext("2d");
		
		if(settings.debug) $('body').append(xcanvas);
	};
	
	var captureImage = function(){
		noContext.drawImage(xvideo, 0, 0, settings.width, settings.height);
			
		var imageData = noContext.getImageData(0, 0, settings.width, settings.height);
        var data = imageData.data;

        for(var i = 0; i < data.length; i += 4) {
          var brightness = (data[i] + data[i+1] + data[i+2])/3; //Grayscale image
          data[i] = brightness; //Red
          data[i+1] = brightness; //Green
          data[i+2] = brightness; //Blue
        }
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
			if(settings.debug) $(xcanvas).css({'border': '1px solid ' + ((diff.trigger)? 'red' : 'transparent')}); 
			
			if(diff.trigger){	
				if($('body').hasClass('loading')){
					window.location.reload(false);
				}
				
				window.clearTimeout(blurTimer);
				blurTimer = window.setTimeout(blur, settings.blurTimer);
			}
			
		},settings.snapRate - 1);	
		
		window.setTimeout(compareImages,settings.snapRate)
	};
	
	var diffImage = function(image1,image2){
		var imageData = noContext.getImageData(0, 0, settings.width, settings.height);
        var data = imageData.data;
		var count = 0;
		for(var i = 0; i < image1.length; i += 4) {
		  data[i] = Math.abs(image1[i]-image2[i]); //Red
          data[i+1] = Math.abs(image1[i+1]-image2[i+1]); //Green
          data[i+2] = Math.abs(image1[i+2]-image2[i+2]); //Blue
		  
		  count+= (Math.abs(image1[i]-image2[i])>2)?1:0;
		  count+= (Math.abs(image1[i+1]-image2[i+1])>2)?1:0;
		  count+= (Math.abs(image1[i+2]-image2[i+2])>2)?1:0;
        }

		var procent = Math.round(count/image1.length *100);
		var trigger = (procent > settings.sensitivity);
		
		return {imageData: imageData, trigger: trigger};
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
			createMotionDetection();
			startMotionDetection();
			createCanvas();
			compareImages();
		},
		start: function(){
			startMotionDetection();
		},
		stop: function(){
			console.log(xstream.active);
			if(xstream.active) xstream.getTracks()[0].stop();
		}
	};
}())