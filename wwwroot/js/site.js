$(document).ready(function(){
	sffjs.setCulture('nl-NL');
	
	calendar.init();
	timer.init();
	weather.init()
	refresh.init();
});
$(window).load(function(){
	refresh.focus();
	refresh.motion();	
});