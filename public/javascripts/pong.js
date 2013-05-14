var socket = io.connect(location.protocol+'//'+location.host+'/');

var session = location.hash.split('#')[1].split(',')[0];
var player = location.hash.split('#')[1].split(',')[1];

socket.emit('player',{session: session,'player':player});

$('#up').on('tap', function(ev) {
    socket.emit('navigation',{'direction':'up','player':player,'session': session});
    $(ev.target).addClass('glow');
    window.setTimeout(function(){
        $(ev.target).removeClass('glow');
    },500);
});

$('#down').on('tap', function(ev){
    socket.emit('navigation',{'direction':'down','player':player,'session': session});
    $(ev.target).addClass('glow');
    window.setTimeout(function(){
        $(ev.target).removeClass('glow');
    },500);
});

// scale font teh dirty way

jQuery('.char').css('font-size',jQuery('.char').height());
