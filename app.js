var SERVER_PORT = 7700;
var golPatterns = require('./lib/gol-patterns.js');
var golUtil = require('./lib/gol-util.js');
var path = require('path');
var express = require('express');
var app = express();

app.use('/', express.static(path.join(__dirname, './public')));

var server = app.listen(SERVER_PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('GOL server listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);

var GOL = require('./lib/gol-engine.js');
var gol = new GOL({ cols: 150, rows: 90, 
  cells: golPatterns['Gosper-glider-gun'].cells
});

gol.on('change', function(changes, perf) {
  io.sockets.emit('change space', {
    totalsteps: gol.getTotalSteps(),
    alivecells: gol.getAliveCells(),
    cells: changes,
    perf: perf
  });
});

var golState = 0;

var serverIPs = golUtil.getServerIps();

io.on('connection', function (socket) {

  socket.on('request dimension', function(data) {
    console.log('GolClient request dimension of space.');
    socket.emit('response dimension', {
      cols: gol.getCols(),
      rows: gol.getRows()
    });
  });

  socket.on('request init', function(data) {
    console.log('GolClient request init state and space');
    socket.emit('change state', {state: (golState === 0) ? 0 : 1});
    socket.emit('change space', {
      totalsteps: gol.getTotalSteps(),
      alivecells: gol.getAliveCells(),
      cells: gol.getCells()
    });
  });

  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  
  // Only Webclient open on localhost can control the GOL.
  // Others (from other computer on the LAN) only see the space 
  // (i.e. they cannot start/stop/step or change cells by click on it).
  if (serverIPs.indexOf(clientIp) >= 0) {

    socket.on('request pattern', function(data) {
      data = data || {};
      console.log('Client request pattern() with params: ' + JSON.stringify(data));
      gol.load(data.name);
    });

    socket.on('request reverse', function(data) {
      data = data || {};
      console.log('Client request reverse() with params: ' + JSON.stringify(data));
      gol.reverse(data.cells);
    });

    socket.on('start', function() {
      console.log('User click on start button.');
      if (golState === 0) {
        golState = 1;
        io.sockets.emit('change state', {state: 1});
        var golRunId = setInterval(function() {
          gol.next();
          if (golState === 2) {
            golState = 0;
            clearInterval(golRunId);
          }
        }, 50);
      }
    });

    socket.on('stop', function() {
      console.log('User click on stop button.');
      if (golState === 1) {
        golState = 2;
        io.sockets.emit('change state', {state: 0});
      }
    });

    socket.on('step', function() {
      console.log('User click on step button.');
      if (golState === 0) gol.next();
    });

    socket.on('reset', function() {
      console.log('User click on reset button.');
      if (golState === 0) gol.reset();
    });
  }
});
