$(document).ready(function(){
	sffjs.setCulture('nl-NL');
	
	//calendar.init(/*{upcommingEvents:3, pastEvents:3}*/);
	//timer.init();
	//refresh.init();
	
	modules.init();
	modules.register(clock);
	modules.register(weather);
	modules.register(calendar, {upcommingEvents:3, pastEvents:3});
	modules.start();
});
$(window).load(function(){
	refresh.focus();
	//refresh.motion();	
});