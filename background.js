chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('index.html', {
		id:'main',
		bounds: {
			width:280,
			height:74,
		},
		frame: 'none',
		alwaysOnTop: true,
		resizable: false
	});	
});
chrome.alarms.onAlarm.addListener(function( alarm ) {
  console.log("Got an alarm!", alarm);
});