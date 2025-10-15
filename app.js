
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'twig');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

// Configure static files with proper MIME types
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: function (res, path) {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve node_modules for frontend dependencies
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules'), {
  setHeaders: function (res, path) {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// development only
if ('development' == app.get('env')) {
  // Error handling middleware for development
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
}

app.get('/', routes.index);
app.get('/game', routes.game);
//app.get('/users', user.list);

var server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.on('navigation', function (data) {
    socket.broadcast.emit('donav', data);
  });

  socket.on('player', function (data) {
    socket.broadcast.emit('player_connect', data);
  });
  socket.on('disconnect', function () {
    socket.broadcast.emit('player_disconnect');
  });
});

