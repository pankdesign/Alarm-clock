// GLOBAL SETTINGS FUNCTIONS
var id;
var settings = {
    alwaysOnTop: true,
    silent: false,
    startWithChrome:true,
    alarms:false,
    alarmSound:'Alarm3.mp3'
};
function genId(){
    chrome.storage.local.get("idCounter", function(result){
        if(result.idCounter){
            id = result.idCounter;
        }
        else{
            id = 0;
        }
    });
}
function updateId(){
    ++id;
    chrome.storage.local.set({"idCounter":id}, function(){
        genId();
    });
    return id;
}
function getTimeTon(time){  // in minutes
    var time_component = time.split(" ");
    var time_component1 = time_component[0].split(":");
    var h = Number(time_component1[0]);
    var m = time_component1[1];
    if(time_component[1]=='PM' && parseInt(time_component1[0])<'12'){
        h = Number(time_component1[0]) + 12;
    }
    else if(time_component[1]=='AM' && time_component1[0]=='12'){
        h = 0;
    }
    var aTimeUser = h+':'+m+':00';
    var date =  new Date();
    var d = date.getDate();
    var mm = date.getMonth()+1; // coz getMonth returns 0 for jan :\
    var y = date.getFullYear();   
    var h=date.getHours();
    var m=date.getMinutes();
    var s=date.getSeconds();
    m = checkTime(m); 
    s = checkTime(s);

    var aTimeDate  = String(y)+'-'+mm+'-'+d+' '+aTimeUser+'.000';
    var aTime  = Date.parse(aTimeDate);

    var nTimeDate = String(y)+'-'+mm+'-'+d+' '+h+':'+m+':'+s+'.000';
    var nTime = Date.parse(nTimeDate);
    
    var n = aTime - nTime ;
    if(n<0){
        n = 1440 + n;
    }       
    return n/60000;
}
function loadSettings(){    
    chrome.storage.local.get('set',function(result){
        var storedSettings = result.set;
        if (storedSettings) {
            settings = storedSettings;
        }
        applySettings();
    });
}
function applySettings(){
    var mainwindow = chrome.app.window.get('main');
    mainwindow.resizeTo(300,100);
    mainwindow.alwaysOnTop = settings.alwaysOnTop;
    // function to check silent mode;
    if(settings.silent){
        $('#alarmIcon').css({'color':'#111111'});
    }else{
        $('#alarmIcon').css({'color':'#5cb85c'});
    }
    // if there is an alarm show alarm icon else hide
    if(settings.alarms){
        $('#alarmIcon').show();
    }
    // checking if always on top
    if(settings.alwaysOnTop){
        $('#ontop').css("backgroundImage","url('../images/pin.png')");
    }else{
        $('#ontop').css("backgroundImage","url('../images/pin2.png')");
    }
    // function to set the src of audio tag;
    $('#audio1').innerHTML = '<source src=../sounds/"'+settings.alarmSound+'" type="audio/mpeg">';
}
function saveSettings(){
    chrome.storage.local.set({set:settings},function(){
         chrome.app.window.get('main').close();
    });
}


// INTERFACE FUNCTIONS
function toggleAlwaysOnTop(){
    var mainwindow = chrome.app.window.get('main');
    if(mainwindow.isAlwaysOnTop()){
        mainwindow.setAlwaysOnTop(false);
        settings.alwaysOnTop = false;
        $('#ontop').css("backgroundImage","url('../images/pin2.png')");
    }
    else{
        mainwindow.setAlwaysOnTop(true);
        settings.alwaysOnTop = true;
        $('#ontop').css("backgroundImage","url('../images/pin.png')");
    }
}
function toggleSilent(){
    if(settings.silent){
        $('#alarmIcon').css({'color':'#5cb85c'});
        settings.silent = false;
    }else{
        $('#alarmIcon').css({'color':'#111111'});
        settings.silent = true;
    }
}
function toggleAlarmsIcon(){
    chrome.alarms.getAll(function(result){
        if(result.length>0){
            settings.alarms = true;
            $('#alarmIcon').show('slow');
        }else{
            settings.alarms = false;
            $('#alarmIcon').hide('slow');
        }
    });
}


// ALARM CLASS
function Alarm(name,time,repeat){
    this.id = updateId(),
    this.name = name,           // String
    this.time = time,           // String format "7:35 AM"
    this.repeat = repeat,       // binary
    this.chromeName = this.name + this.id,
    this.n = getTimeTon(time),
    this.active = false
}
Alarm.prototype.activeToggle = function(){
    if(this.active){
        chrome.alarms.clear(this.chromeName, function(){
            this.acitve = false;
            toggleAlarmsIcon();
        });
    }
    else{
        console.log(this.n);
        chrome.alarms.create(this.chromeName, {delayInMinutes: this.n, periodInMinutes: 5});
        this.acitve = true;
        settings.silent = false;
        settings.alarms = true;
        $('#alarmIcon').show('slow');
    }
}
Alarm.prototype.repeatToggle = function(){
    if(this.repeat){
        this.repeat = false;
    }
    else{
        this.repeat = true;
    }
}
function saveAlarm(alarm){
    alarm.activeToggle();
    chrome.storage.local.get('alarms', function(result){   
        var alarmlisttemp = result.alarms;
        if(!alarmlisttemp){
            alarmlisttemp = [];
        }
        alarmlisttemp.push(alarm);
        chrome.storage.local.set({alarms:alarmlisttemp});
    });
}
function createAlarm(){
    var time = $('#time-picked').val();
    var alarm = new Alarm('Alarm',time,false);
    saveAlarm(alarm);
}
function deleteAlarm(chromename){
    chrome.storage.local.get('alarms', function(result){        
        var alarmlisttemp = result.alarms;
        if(alarmlisttemp.length == 0){
            console.log("invalid Delete");
        }
        else{
            for(var i = 0; i < alarmlisttemp.length; i++){
                if(alarmlisttemp[i].chromeName == chromename){
                    alarmlisttemp = alarmlisttemp.splice(i,1);
                    break;
                }
            }
            chrome.storage.local.set({alarms:alarmlisttemp});
            toggleAlarmsIcon();
        }                
    });
}


// RINGING ALARM
function ringAlarm(alarm){
    if(!settings.silent){
        document.getElementById('audio1').play();
        $('#alarmringbox').animate({bottom:'0px'},'fast');
        // Put to snooze
        $('#snooze').click(function(){
            document.getElementById('audio1').pause();
            $('.overlay').animate({bottom:'-100px'});
            settings.alarms = true;
            toggleAlarmsIcon();
        });
        // Dismiss the alarm
        $('#dismiss').click(function(){
            document.getElementById('audio1').pause();
            $('.overlay').animate({bottom:'-100px'});        
            chrome.alarms.clear(alarm.name, function(){
                deleteAlarm(alarm.name);
            });
        });
    }
}


/// LOAD CLOCK
function checkTime(i) {
    if (i<10) {i = "0" + i};        // add zero in front of numbers < 10
    return i;
}
function loadClock(){               // function that loads the clocks and keep it running
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
    var k = 'AM';
    if(h>12){
        k = 'PM';
        h = h-12;        
    }
    else if(h==0){
        h = 12;
        loadDate();
    }   
    
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('hour').innerHTML = h;
    document.getElementById('min').innerHTML = m;
    document.getElementById('sec').innerHTML = s;
    document.getElementById('key').innerHTML = k;
    var t = setTimeout(function(){loadClock()},500);
}
function loadDate(){
    var today = new Date();
    var day = ['Sun','Mon','Tue','Wed','Thur','Fri','Sat'];
    var month = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec'];
    var da = day[today.getDay()];
    var d = today.getDate();
    var m = month[today.getMonth()];
    var y = today.getFullYear();
    document.getElementById('day').innerHTML = da;
    document.getElementById('date').innerHTML = d;
    document.getElementById('month').innerHTML = m;
    document.getElementById('year').innerHTML = y;
}


    
// MAIN FUNCTION
$(document).ready( function() {
    var mainwindow = chrome.app.window.get('main');
    loadSettings();
    mainwindow.resizeTo(300,100);
    genId();
    loadClock(); 
    loadDate();
    chrome.alarms.onAlarm.addListener(ringAlarm);
//    mainwindow.onClosed.addListener();
    
    // Main controls visible toggle
    $("body").on({
        mouseover:function(){$(".ctrl").show();},  
        mouseout:function(){$(".ctrl").hide();}  
    });

    // Menu hover btn toggle
    $('#zoombtn').mouseenter(function() {     
        $('#clock').animate({width:'-=50'}, 'slow');
        $('.clockface').animate({fontSize:'30px', marginTop:'8px'}, 'slow');
        $('.dateface').animate({fontSize:'6px'}, 'slow'); 
        $('#zoombtn').animate({width:'50px',height:'100px'},'slow'),
        $('#btn0').hide('slow');
        $('.extrabtn').show('slow');        
    }),
    $('#zoombtn').mouseleave(function(){       
        $('#clock').delay(1000).animate({width:"+=50"}, 'slow');
        $('#zoombtn').delay(1000).animate({width:'26px',height:'26px'},'slow'),
        $('.clockface').delay(1000).animate({fontSize:"45px", marginTop:'0px'},'slow');
        $('.dateface').delay(1000).animate({fontSize:"12px"}, 'slow');             
        $('.extrabtn').delay(1000).hide('slow');
        $('#btn0').delay(1000).show('slow');
    });

    // Create alarm btn function
    $('#alarmbtnmain').click(function(){       
        $('#alarmbox').animate({bottom:'0px'},'slow');
    }); 

    // Time picker control   
    $('.btn-pic').click(function(){
        var key = $(this).attr('id');

        var h = parseInt($('#hv').html());
        var m = parseInt($('#mv').html());
        var k = $('#kv').html();
        function inchour(){
            if(h!=12){
                h++;
                if(h==12){
                    changek();
                }
            } else {
                h = 1;
            }
        }
        function incmins(){
            if(m!=55){
                m += 5;
            } else {
                m = 0;
                inchour();
            }
            
        }
        function dechour(){
            if(h!=1){
                h--;
                if(h==11){
                    changek();
                }
            } else {
                h = 12;
            }
        }
        function decmins(){
            if(m != 0){
                m-=5;
            } else {
                m = 55;
                dechour();
            }
        }
        function changek(){
            if(k == 'AM'){
                k = 'PM';
            }else{
                k = 'AM';
            }
        }
        if(key==='hup'){
            inchour();
        } else if(key==='hdn'){
            dechour();
        } else if(key==='mup'){
            incmins();
        } else if(key==='mdn'){
            decmins();
        } else if(key==='kup' || key==='kdn'){
            changek();
        }
        h = h.toString();
        if(m<10){
            m = '0'+m;
        } else {
            m = m.toString();
        }
        $('#hv').html(h);
        $('#mv').html(m);
        $('#kv').html(k);
        $('#time-picked').val(h+':'+m+' '+k);
    });

    // Save alarm control
    $('#savealarm').click(function(){
        createAlarm();
        $('#alarmbox').animate({bottom:'-100px'});
    });

    // View Settings control
    $('#settings').click(function(){       
        $('#settingbox').animate({bottom:'0px'},'slow');
    });

    // Closing an overlay 
    $('.close1').click(function(){
        $('.overlay').animate({bottom:'-100px'});
    });

    // Always on top Control
    /*$('#ontop').click(function(){
        toggleAlwaysOnTop();
    });*/

    // Toggle silent
    $('#alarmIcon').click(function(){
        toggleSilent();
    });

    // Close main Window
    $('#closebtn').click(function(){
        saveSettings();
    })
});