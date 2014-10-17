require([
    "/socket.io/socket.io.js"
    , "/javascripts/pointerevents.js"
    , "/javascripts/jquery.js"
    , "/javascripts/mousetrap.js"
], function (io) {
    var socket = io(location.protocol + '//' + location.host + '/');

    var session = location.hash.split('#')[1].split(',')[0];
    var player = location.hash.split('#')[1].split(',')[1];

    socket.emit('player', {session: session, 'player': player})

    $('.char')
        .css('font-size',$('.char').height())
        .css('line-height',$('.char').height()+'px');


    $('#up').on('pointerup', function (ev) {
        socket.emit('navigation', {'direction': 'up', 'player': player, 'session': session});
        $(ev.target).addClass('glow');
        window.setTimeout(function () {
            $(ev.target).removeClass('glow');
        }, 500);
    });

    $('#down').on('pointerup', function (ev) {
        socket.emit('navigation', {'direction': 'down', 'player': player, 'session': session});
        $(ev.target).addClass('glow');
        window.setTimeout(function () {
            $(ev.target).removeClass('glow');
        }, 500);
    });

    Mousetrap.bind('up',function(){
        socket.emit('navigation', {'direction': 'up', 'player': player, 'session': session});
        $(ev.target).addClass('glow');
        window.setTimeout(function () {
            $(ev.target).removeClass('glow');
        }, 500);
        return false;                     
    },'keyup');

    Mousetrap.bind('down',function(){
        socket.emit('navigation', {'direction': 'down', 'player': player, 'session': session});
        $(ev.target).addClass('glow');
        window.setTimeout(function () {
            $(ev.target).removeClass('glow');
        }, 500);
        return false;
    },'keyup');
});


