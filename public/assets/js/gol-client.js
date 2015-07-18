(function() {
  
  function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port);
  }

  var GolClient = function() {
    var self = this;
    self.socket = io.connect(getBaseURL());
  };

  GolClient.prototype.init = function(params) {
    var self = this;

    params = params || {};

    console.log('golClient.init() ...');

    this.button_start = document.getElementById('start');
    this.button_stop = document.getElementById('stop');
    this.button_step = document.getElementById('step');
    this.button_reset = document.getElementById('reset');

    this.status_totalsteps = document.getElementById('totalsteps');
    this.status_alivecells = document.getElementById('alivecells');
    this.status_time_usage = document.getElementById('time_usage');
    this.status_memory_usage = document.getElementById('memory_usage');

    this.registerEvent(this.button_start, 'click', function() {
      self.socket.emit('start');
    });

    this.registerEvent(this.button_stop, 'click', function() {
      self.socket.emit('stop');
    });

    this.registerEvent(this.button_step, 'click', function() {
      self.socket.emit('step');
    });

    this.registerEvent(this.button_reset, 'click', function() {
      self.socket.emit('reset');
    });

    self.socket.on('change state', function(data) {
      if (data.state === 0) {
        self.button_start.disabled = false;
        self.button_stop.disabled = true;
        self.button_step.disabled = false;
        self.button_reset.disabled = false;
      } else {
        self.button_start.disabled = true;
        self.button_stop.disabled = false;
        self.button_step.disabled = true;
        self.button_reset.disabled = true;
      }
    });

    this.socket.emit('request init');

    console.log('golClient.init() done.');
  }

  GolClient.prototype.registerEvent = function (ele, event, handler, capture) {
    ele.addEventListener(event, handler, (capture == true) ? true : false);
  }

  var gol = new GolClient();

  gol.registerEvent(window, 'load', function() {
    gol.init();
  });

})();
