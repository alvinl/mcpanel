
/**
 * Module dependencies.
 */


var express = require('express')
  , http = require('http')
  , routes = require('./routes')
  , path = require('path');

var proc = require('child_process')
  , mc_server = null
  , Tail = require('tail').Tail;

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var mfolder = 'minecraft/'

var mclog = 'server.log';
var tail = new Tail(mclog);

app.configure(function(){
  app.set('port', 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/console', routes.console);

server.listen(app.get('port'), function() {
  console.log('Express listening on port: ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {

  socket.on('check_stat', function(data) {
    if (mc_server) {
      io.sockets.emit('status', true);
    } else if (!mc_server) {
      io.sockets.emit('status', false);
    }
  });

  if (mc_server) {
    socket.emit('status', true);
  } else if (!mc_server) {
    socket.emit('status', false);
  };

  socket.on('start', function(name) {
    server = name;
    mc_server = proc.spawn(mfolder + "java", ['-Xmx204M', '-Xms204M', '-jar', 'server/minecraft_server.jar', 'nogui']);

    // show server status
    io.sockets.emit('status', true);

    // server log (1)
    mc_server.stdout.on('data', function(data) {
      if (data) {
        io.sockets.emit('console', "" + data + "\n");
      }
    });

    // server log
    mc_server.stderr.on('data', function(data) {
      if (data) {
        io.sockets.emit('console', "" + data.slice(0, data.length - 1));
      }
    });

    // Server end signal
    mc_server.on('exit', function() {
      mc_server = server = null;
      io.sockets.emit('status', false);
    });
  }); // end on.start

  socket.on('command', function (cmd) {
    if (mc_server) {
      io.sockets.emit('console', "Player Command: " + cmd);
      mc_server.stdin.write(cmd + "\r");
    } else {
      socket.emit('fail', cmd);
    }
  });
});

tail.on('line', function(data) {
  io.sockets.emit('console-data', {channel: 'Console', value: data});
});


