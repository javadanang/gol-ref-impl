(function() {
  
  function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port);
  }

  var GolClient = function() {
    var self = this;

    self.socket = io.connect(getBaseURL());

    self.socket.on('change space', function(data) {
      var cells = data.cells || [];
      
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

    self.selected_cell;
    self.selected_cells = [];
    self.collection_mode = false;

    params = params || {};

    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.getAttribute('width');
    this.height = this.canvas.getAttribute('height');

    this.registerEvent(this.canvas, 'mousedown', function(event) {
      self.collection_mode = true;
      self.selected_cell = self.positionOfMouseOnCanvas(event);
      self.selected_cells.push(self.selected_cell);
    });

    this.registerEvent(this.canvas, 'mouseup', function(event) {
      self.socket.emit('request reverse', {cells: self.selected_cells});
      self.selected_cell = undefined;
      self.selected_cells = [];
      self.collection_mode = false;
    });

    this.registerEvent(this.canvas, 'mousemove', function(event) {
      if (!self.collection_mode) return;

      var pos = self.positionOfMouseOnCanvas(event);
      if (pos.x != self.selected_cell.x || pos.y != self.selected_cell.y) {
        self.selected_cell = pos;
        self.selected_cells.push(pos);
      }
    });

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
    this.button_random = document.getElementById('random');
    this.checkbox_toroidal = document.getElementById('checkbox_toroidal');

    this.status_totalsteps = document.getElementById('totalsteps');
    this.status_alivecells = document.getElementById('alivecells');
    this.status_time_usage = document.getElementById('time_usage');
    this.status_memory_usage = document.getElementById('memory_usage');

    self.pattern_list = document.getElementById('pattern-list');

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

    this.registerEvent(this.button_random, 'click', function() {
      self.socket.emit('random');
    });

    self.registerEvent(self.checkbox_toroidal, 'change', function() {
      self.socket.emit('request toroidal', {value: self.checkbox_toroidal.checked});
    });

    self.registerEvent(self.pattern_list, 'change', function() {
      self.socket.emit('request pattern', {name: self.pattern_list.value});
    });
    
    self.socket.on('change state', function(data) {
      if (data.state === 0) {
        self.button_start.disabled = false;
        self.button_stop.disabled = true;
        self.button_step.disabled = false;
        self.button_reset.disabled = false;
        self.button_random.disabled = false;
        self.checkbox_toroidal.disabled = false;
        self.pattern_list.disabled = false;
      } else {
        self.button_start.disabled = true;
        self.button_stop.disabled = false;
        self.button_step.disabled = true;
        self.button_reset.disabled = true;
        self.button_random.disabled = true;
        self.checkbox_toroidal.disabled = true;
        self.pattern_list.disabled = true;
      }
    });
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

  GolClient.prototype.positionOfMouseOnCanvas = function(event) {
    event = event || window.event;

    // Get the horizontal & vertical coordinates of the mouse
    var mouseX = event.pageX;
    var mouseY = event.pageY;

    // Get the horizontal & vertical coordinates of the canvas
    var canvasX = 0;
    var canvasY = 0;
    var domObj = event.target ||  event.srcElement;
    while(domObj.offsetParent) {
      canvasX += domObj.offsetLeft;
      canvasY += domObj.offsetTop;
      domObj = domObj.offsetParent;
    }

    var cell_size = this.cell_size + 1;
    var x = Math.ceil(((mouseX - canvasX)/cell_size) - 1);
    var y = Math.ceil(((mouseY - canvasY)/cell_size) - 1);

    return {x: x, y: y};
  }

  GolClient.prototype.registerEvent = function (ele, event, handler, capture) {
    ele.addEventListener(event, handler, (capture == true) ? true : false);
  }

  var gol = new GolClient();

  gol.registerEvent(window, 'load', function() {
    gol.init();
  });

})();
