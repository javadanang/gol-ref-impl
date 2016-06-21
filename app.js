var SERVER_PORT = 8080;

var path = require('path');
var express = require('express');
var app = express();

app.use('/', express.static(path.join(__dirname, './public')));

var server = app.listen(SERVER_PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('GOL server listening at http://%s:%s', host, port);
});

var ioserver = require('./lib/gol-ioserver.js');
ioserver.listen(server);
