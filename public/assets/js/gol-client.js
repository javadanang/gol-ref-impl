(function() {
  
  function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port);
  }

  var GolClient = function() {
    var self = this;

    self.socket = io.connect(getBaseURL());

    self.socket.on('change space', function(data) {
      console.log('Server request change:' + JSON.stringify(data));
      
      var cells = data.cells;
      for(var k=0; k<cells.length; k++) {
        self.drawCell(cells[k].x, cells[k].y, cells[k].v == 1);
      }

      self.status_totalsteps.innerHTML = (data.totalsteps) ? data.totalsteps : '-';
      self.status_alivecells.innerHTML = (data.alivecells) ? data.alivecells : '-';

      data.perf = data.perf || {};
      self.status_time_usage.innerHTML = 
          (data.perf.time_usage) ? data.perf.time_usage : '-';

      var mem = (data.perf.memory_usage) ? data.perf.memory_usage : '0';
      mem = parseInt(mem) / 1024;
      self.status_memory_usage.innerHTML = mem;
    });
  };

  GolClient.prototype.init = function(params) {
    var self = this;

    params = params || {};

    console.log('golClient.init() ...');

    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.getAttribute('width');
    this.height = this.canvas.getAttribute('height');

    self.socket.on('response dimension', function(data) {
      self.cols = data.cols;
      self.rows = data.rows;

      self.cell_border = 1;
      self.cell_size = 0 - self.cell_border + Math.min(
        Math.floor((self.width - self.cell_border) / self.cols),
        Math.floor((self.height - self.cell_border) / self.rows));

      self.drawSpace();
      self.socket.emit('request init');
    });

    this.socket.emit('request dimension');

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

    console.log('golClient.init() done.');
  }

  GolClient.prototype.drawSpace = function() {
    this.context.fillStyle = 'lightgray';
    this.context.fillRect(0, 0, this.width, this.height);

    for (var i = 0 ; i < this.cols; i++) {
      for (var j = 0 ; j < this.rows; j++) {
        this.drawCell(i, j, false);
      }
    }
  }

  GolClient.prototype.drawCell = function(i, j, alive) {
    this.context.fillStyle = (alive) ? 'green' : 'white';
    this.context.fillRect(
      this.cell_border + (this.cell_border + this.cell_size) * i, 
      this.cell_border + (this.cell_border + this.cell_size) * j, 
      this.cell_size, this.cell_size);
  }

  GolClient.prototype.registerEvent = function (ele, event, handler, capture) {
    ele.addEventListener(event, handler, (capture == true) ? true : false);
  }

  var gol = new GolClient();

  gol.registerEvent(window, 'load', function() {
    gol.init();
  });

})();
