$(document).ready(function(){
	sffjs.setCulture('nl-NL');
	
	modules.init();
	modules.register(clock);
	modules.register(weather);
	modules.register(weatherforecast);
	modules.register(calendar/*, {upcommingEvents:3, pastEvents:3}*/);
	modules.register(refresh);
	
	modules.start();
});
$(window).load(function(){
	refresh.focus();
});