$(document).ready(function(){
	sffjs.setCulture('nl-NL');
	
	modules.init();
	modules.register(clock);
	modules.register(weather);
	modules.register(weatherforecast);
	modules.register(calendar, {upcommingEvents:5, pastEvents:5});
	modules.register(refresh);
	modules.register(news);
	
	modules.start();
});
$(window).load(function(){
	//refresh.focus();
	modules.get('refresh').focus();
});