chrome.alarms.getAll(function(result){
	var i;
	for(i in result){
		console.log(result[i]);
	}
})
	var time = '8:10 AM';
	var time_component = time.split(" ");
    var time_component1 = time_component[0].split(":");
    var h = Number(time_component1[0]);
    var m = time_component1[1];
    if(time_component[1]=='PM' && time_component1[0]<'12'){
        h = Number(time_component1[0]) + 12;
    }
    else if(time_component[1]=='AM' && time_component1[0]=='12'){
        h = 0;
    }
    var kell = h+':'+m+':00';
    var date =  new Date();
    var d = date.getDate();
    var mo = date.getMonth();
    var y = date.getFullYear();
    var kal  = String(y)+'-'+mo+'-'+d+' '+kell+'.000';
    var aTime  = Date.parse(kal);
    var h=date.getHours();
    var m=date.getMinutes();
    var s=date.getSeconds();
    var y=date.getFullYear();
    var mm=date.getMonth();
    var d = date.getDate();
    var k = 'AM';
    var newDate = String(y);
    newDate += '-'+mm+'-'+d+' '+h+':'+m+':'+s+'.000';
    var nTime = Date.parse(newDate);
    
    var n = aTime - nTime ;
    if(n<0){
        n = 1440 + n
    }


    //check the alarms script
    chrome.alarms.getAll(function(result){
		var i;
		for(i in result){
			console.log(result[i]);
		}
	})

	// clear all alarms
	chrome.alarms.clearAll(function(){
		console.log('clear');
	})

	// clear one alarms
	chrome.alarms.clear(string name, function callback)

	// local storage get
	chrome.storage.local.get('alarms',function(result){
		console.log(result.alarms);
	})

	//local storage clear
	chrome.storage.local.clear()

    var alarmlisttemp = [{name:'pank',age:10},{name:'Tank',age:5},{name:'mohit',age:45}];
    chrome.storage.local.set({pank:alarmlisttemp}, function(){
        console.log('saved');
    });
    chrome.storage.local.get('pank',function(result){
        console.log(result);
    })
