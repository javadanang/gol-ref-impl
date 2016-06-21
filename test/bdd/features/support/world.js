var ioclient = require('socket.io-client');

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var World = function(callback) {
  this.socketclient = ioclient.connect('http://0.0.0.0:8080', options);
  callback && callback();
}

module.exports.World = World;