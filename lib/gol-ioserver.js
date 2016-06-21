var SPACE_DIMS = {
  large: {cols: 180, rows: 108},
  medium: {cols: 150, rows: 90},
  small: {cols: 100, rows: 60}
};

var CURRENT_SPACE_DIM = 'large';

var io = require('socket.io')();

var golPatterns = require('./gol-patterns.js');
var golUtil = require('./gol-util.js');

var GOL = require('./gol-engine.js');
var gol = new GOL({ 
  cols: SPACE_DIMS[CURRENT_SPACE_DIM].cols, 
  rows: SPACE_DIMS[CURRENT_SPACE_DIM].rows, 
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

gol.on('finish', function() {
  if (golState === 1) {
    golState = 2;
    io.sockets.emit('change state', {state: 0});
  }
})

var golState = 0;

var serverIPs = golUtil.getServerIps();

io.on('connection', function (socket) {

  socket.on('request dimension', function(data) {
    console.log('GolClient request dimension of space with params:' +
      JSON.stringify(data));
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
  var clientIp = golUtil.getClientIp(socket);

  
  // Only Webclient open on localhost can control the GOL.
  // Others (from other computer on the LAN) only see the space 
  // (i.e. they cannot start/stop/step or change cells by click on it).
  if (process.env['CHANGABLE_REMOTE'] || serverIPs.indexOf(clientIp) >= 0) {

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

    socket.on('request toroidal', function(data) {
      data = data || {};
      console.log('Client request toroidal() with params: ' + JSON.stringify(data));
      gol.setToroidal(data.value);
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

    socket.on('random', function() {
      console.log('User click on random button.');
      if (golState === 0) gol.random();
    });
  }
});

module.exports = io;
