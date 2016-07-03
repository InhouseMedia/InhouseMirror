var refresh = (function(){
	'use strict';
	
	var _name = 'refresh';

	var _blurTimer = null;
	var _compareTimer = null;
	
	var _noCanvas = null;
	var _noContext = null;
	var _xvideo = null;
	var _xstream = null;
	var _xcanvas = null;
	var _xcontext = null;
	
	var _settings = {
		motionDetection: true,
		blurTimer: (1000 * 60),
		snapRate: 800,
		sensitivity: 10,
		videoWidth: 640,
		videoHeight: 480,
		imageWidth: 64,
		imageHeight: 48,
		debug: false
	};
	
	var _init = function(options){
		_settings = $.extend({}, _settings, options);
		_settings.element = $(_settings.element);
		_settings.debug = !_settings.debug? config.debug : _settings.debug;
		//$(window)._focus(function(){ location.reload(true); });
	
		_noCanvas = $('<canvas>').attr({'width': _settings.imageWidth, 'height': _settings.imageHeight});
		_noContext = _noCanvas.get(0).getContext("2d");
	};
	
	var _createRefreshHeader = function(){
		var today = new Date();
		var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1,0,0,0,10);
		var refresh = Math.round((tomorrow - today)/1000);
		var meta = $('<meta>').attr({'http-equiv': 'refresh', 'content': refresh });
	
		meta.insertAfter($('head meta[charset]'));
		
		var refreshConsoleTime = (refresh/3600 > 1)? refresh/3600: refresh/60;
		var refreshConsoleType = (refresh/3600 > 1)? 'hours.': 'minutes.';
		console.log('Refresh page in', (refreshConsoleTime).toFixed(2), refreshConsoleType);
	};
	
	var _setBlurTimer = function(){
		if(!_settings.motionDetection) return;
		_blurTimer = window.setTimeout(_blur,_settings.blurTimer);
	};
	
	var _createMotionDetection = function(){
		var video = $('<video>').attr({'autoplay': true, 'id': 'motion', 'width': _settings.videoWidth, 'height': _settings.videoHeight});
			video.click(_compareImages);
		
		_xvideo = video.get(0);
		if(_settings.debug) $('body').append(video);
	};
	
	var _startMotionDetection = function(){
		var videoObj = {'video': true};
		
		navigator.getUserMedia = navigator.getUserMedia ||
                          		navigator.webkitGetUserMedia ||
                          		navigator.mozGetUserMedia ||
                         		navigator.msGetUserMedia;
		  
		navigator.getUserMedia(videoObj, function(stream){
				_xvideo.src = window.URL.createObjectURL(stream);
				_xvideo.play();
				_xstream = stream;

				_createCanvas();
				_compareImages();

		}.bind(this), function(e){
			console.log(e.code); 
			_settings.motionDetection = false;
		});
	};
	
	var _createCanvas = function(){
		_xcanvas = $('<canvas>').attr({'id':'canvas', 'width': _settings.imageWidth, 'height': _settings.imageHeight});
		
		_xcontext = _xcanvas.get(0).getContext("2d");
		
		if(_settings.debug) $('body').append(_xcanvas);
	};
	
	var _captureImage = function(){
		_noContext.drawImage(_xvideo, 0, 0, _settings.videoWidth, _settings.videoHeight, 0, 0 , _settings.imageWidth, _settings.imageHeight);
			
		var imageData = _noContext.getImageData(0, 0, _settings.imageWidth, _settings.imageHeight);
        var data = imageData.data;

		return data;
	};
	
	var _compareImages = function(){
		var image1 = _captureImage();
		var image2;
		var diff;

		window.setTimeout(function(){	
			image2 = _captureImage();
			diff = _diffImage(image1,image2);
			_xcontext.putImageData(diff.imageData, 0,0);
		
			//testing
			if(_settings.debug) {
				$(_xcanvas).css({'border': '1px solid ' + ((diff.procent >= _settings.sensitivity)? 'red' : 'transparent')});
				$(_xvideo).css({'border': '1px solid ' + ((diff.procent >= _settings.sensitivity)? 'red' : 'transparent')});
			} 
			
			if(diff.procent >= _settings.sensitivity){	
				if($('body').hasClass('loading')){
					_focus();
					$('body').trigger('refresh');
				}
				console.log('motion trigger', diff.procent, '%');
				window.clearTimeout(_blurTimer);
				_blurTimer = window.setTimeout(_blur, _settings.blurTimer);
			}
			
		},_settings.snapRate);	
		
		_compareTimer = window.setTimeout(_compareImages,_settings.snapRate)
	};
	
	var _diffImage = function(image1,image2){
		var imageData = _noContext.getImageData(0, 0, _settings.imageWidth, _settings.imageHeight);
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
		if(_settings.debug) console.log(procent + '%');
		return {imageData: imageData, procent: procent};
	};
	
	var _focus = function(){
		$('body.loading').removeClass('loading');
	};
	
	var _blur = function(){
		$('body').addClass('loading');
	};
	
	return {
		name: _name,
		init: function(options){	
			_init(options);
		},
		start: function(){
			_createRefreshHeader();

			this.motion();

			if(!_settings.motionDetection) return;

			_setBlurTimer();
		},
		refresh: function(){
			// DUMMY
		},
		focus: function(){
			_focus();
		},
		blur: function(){
			_blur();
		},
		motion: function(){
			if(!_settings.motionDetection) return;
			
			_createMotionDetection();
			_startMotionDetection();
		},
		stop: function(){
			if(_xstream.active){
				window.clearTimeout(_compareTimer);
				_xstream.getTracks()[0].stop();	
			} 
		}
	};
}());