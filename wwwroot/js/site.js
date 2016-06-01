$(document).ready(function(){
	sffjs.setCulture('nl-NL');
	
	calendar.init({upcommingEvents:3, pastEvents:3});
	timer.init();
	weather.init()
	refresh.init();
});
$(window).load(function(){
	refresh.focus();
	refresh.motion();	
});