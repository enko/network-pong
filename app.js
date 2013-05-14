
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'twig');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/game', routes.game);
//app.get('/users', user.list);

var http = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(http);

io.sockets.on('connection', function (socket) {
  socket.on('navigation', function (data) {
      socket.broadcast.emit('donav',data);
  });

  socket.on('player', function (data) {
      socket.broadcast.emit('player_connect',data);
  });
  socket.on('disconnect', function() {
      socket.broadcast.emit('player_disconnect');
  });
});

