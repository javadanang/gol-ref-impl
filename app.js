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
var gol = new GOL({ cols: 40, rows: 25, 
  cells: golPatterns['Gosper-glider-gun'].cells
});

var display = function() {
  var cols = gol.getCols();
  var rows = gol.getRows();
  for(var i=0; i<rows; i++) {
    for(var j=0; j<cols; j++) {
      process.stdout.write(gol.getCell(j,i) ? ' x' : ' .');
    }
    process.stdout.write('\n');
  }
}

gol.on('change', function(changes, perf) {
  console.log('Step #' + gol.getTotalSteps() + ' / Alive cells: ' + gol.getAliveCells());
  console.log('Time/Memory usage: ' + JSON.stringify(perf));
  display();
});

var golState = 0;

io.on('connection', function (socket) {

  socket.on('request init', function(data) {
    socket.emit('change state', {state: (golState === 0) ? 0 : 1});
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
  });  

});
