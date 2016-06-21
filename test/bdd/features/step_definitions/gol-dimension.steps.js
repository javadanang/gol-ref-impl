
var assert = require('chai').assert;

module.exports = function() {

  this.World = require('../support/world.js').World;

  this.When(/^I send a dimension request to websocket service$/, function (callback) {
    var self = this;
    this.socketclient.on('response dimension', function(data) {
      self.dimension = data;
      self.socketclient.disconnect();
      callback();
    });
    this.socketclient.emit('request dimension');
  });

  this.Then(/^a dimension of board are (\d+) cols and (\d+) rows$/, function (arg1, arg2, callback) {
    var self = this;
    assert.equal(self.dimension.cols, parseInt(arg1));
    assert.equal(self.dimension.rows, parseInt(arg2));
    callback();
  });
};