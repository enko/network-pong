var socket = io.connect('http://localhost');
socket.on('news', function (data) {
    console.log(data);
    socket.emit('navigation', { my: 'data' });
});

$('#up').click(function(ev){
    socket.emit('navigation',{direction:'up','player':1});
    $(ev.target).addClass('glow');
    window.setTimeout(function(){
        $(ev.target).removeClass('glow');
    },500);
});

$('#down').click(function(ev){
    socket.emit('navigation',{direction:'down','player':1});
    $(ev.target).addClass('glow');
    window.setTimeout(function(){
        $(ev.target).removeClass('glow');
    },500);
});
