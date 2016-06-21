var sinon = require('sinon');
var assert = require('chai').assert;
var rewire = require('rewire');
var http = require('http');
var ioclient = require('socket.io-client');
var ioserver = rewire('../../lib/gol-ioserver.js');

var SERVER_PORT = 7700;
var socketURL = 'http://0.0.0.0:' + SERVER_PORT;

var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe("GOL Socket.io Server Tests", function () {

  var server;
  var gol, golStub;

  beforeEach(function () {
    gol = ioserver.__get__("gol");

    server = http.createServer().listen(SERVER_PORT, function() {
        console.log("Server listening on: http://0.0.0.0:%s", SERVER_PORT);
    });

    var socket = ioserver.attach(server);

    // socket.on('connection', function(client) {
    //   client.on('disconnect', function() {
    //     server.close();
    //   });
    // });
  });

  afterEach(function(done) {
    ioserver.__set__("gol", gol);

    server.on('close', function() {
      done();
    });
  });

  it('Test "request dimension/response dimension" event', function(done) {
    golStub = sinon.stub({
      getCols: function() {},
      getRows: function() {}
    });
    golStub.getCols.returns(120);
    golStub.getRows.returns(100);
    ioserver.__set__("gol", golStub);

    var client = ioclient.connect(socketURL, options);
    client.on('response dimension', function(data) {
      assert(data.cols === 120, 'Cols should equal 180');
      assert(data.rows === 100, 'Rows should equal 108');
      client.disconnect();
      server.close();
      done();
    });
    client.emit('request dimension');
  });


  it('Test "request init/change state" event', function(done) {
    var client = ioclient.connect(socketURL, options);
    client.on('change state', function(data) {
      assert(data.state === 0, 'state should equal 0');
      client.disconnect();
      server.close();
      done();
    });
    client.emit('request init');
  });

  it('Test "request init/change space" event', function(done) {
    var client = ioclient.connect(socketURL, options);
    client.on('change space', function(data) {
      var cols = gol.getCols();
      var rows = gol.getRows();
      var alive = 0;
      for(var k=0; k<data.cells.length; k++) {
        alive++;
        assert(data.cells[k].v === gol.getCell(data.cells[k].x, data.cells[k].y),
          'cell[' + data.cells[k].x + ',' + data.cells[k].y + '] is incorrect');
      }
      assert(alive === gol.getAliveCells(),
        'Number of alive cells is incorrect');
      client.disconnect();
      server.close();
      done();
    });
    client.emit('request init');
  });
});
