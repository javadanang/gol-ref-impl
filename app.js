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
