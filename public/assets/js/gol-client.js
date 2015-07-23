(function(exports) {
  
  function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port);
  }

  var GolClient = function() {
    this.socket = io.connect(getBaseURL());
  };

  GolClient.prototype.init = function(params) {
    var self = this;
    params = params || {};

    self.selected_cell;
    self.selected_cells = [];
    self.collection_mode = false;

    self.clear_space = false;
    self.canvas = document.getElementById('canvas');
    self.context = self.canvas.getContext('2d');

    self.width = self.canvas.getAttribute('width');
    self.height = self.canvas.getAttribute('height');

    self.registerEvent(self.canvas, 'mousedown', function(event) {
      self.collection_mode = true;
      self.selected_cell = self.positionOfMouseOnCanvas(event);
      self.selected_cells.push(self.selected_cell);
    });

    self.registerEvent(self.canvas, 'mouseup', function(event) {
      self.socket.emit('request reverse', {cells: self.selected_cells});
      self.selected_cell = undefined;
      self.selected_cells = [];
      self.collection_mode = false;
    });

    self.registerEvent(self.canvas, 'mousemove', function(event) {
      if (!self.collection_mode) return;
      var pos = self.positionOfMouseOnCanvas(event);
      if (pos.x != self.selected_cell.x || pos.y != self.selected_cell.y) {
        self.selected_cell = pos;
        self.selected_cells.push(pos);
      }
    });

    self.button_start = document.getElementById('start');
    self.button_stop = document.getElementById('stop');
    self.button_step = document.getElementById('step');
    self.button_reset = document.getElementById('reset');
    
    self.button_random = document.getElementById('random');
    self.checkbox_toroidal = document.getElementById('checkbox_toroidal');
    self.pattern_list = document.getElementById('pattern-list');

    self.world_cols = document.getElementById('world_cols');
    self.world_rows = document.getElementById('world_rows');
    self.status_totalsteps = document.getElementById('totalsteps');
    self.status_alivecells = document.getElementById('alivecells');
    self.status_time_usage = document.getElementById('time_usage');
    self.status_memory_usage = document.getElementById('memory_usage');

    self.registerEvent(self.button_start, 'click', function() {
      self.socket.emit('start');
    });

    self.registerEvent(self.button_stop, 'click', function() {
      self.socket.emit('stop');
    });

    self.registerEvent(self.button_step, 'click', function() {
      self.socket.emit('step');
    });

    self.registerEvent(self.button_reset, 'click', function() {
      self.clear_space = true;
      self.socket.emit('reset');
    });

    self.registerEvent(self.button_random, 'click', function() {
      self.clear_space = true;
      self.socket.emit('random');
    });

    self.registerEvent(self.checkbox_toroidal, 'change', function() {
      self.socket.emit('request toroidal', {value: self.checkbox_toroidal.checked});
    });

    self.registerEvent(self.pattern_list, 'change', function() {
      self.clear_space = true;
      self.socket.emit('request pattern', {name: self.pattern_list.value});
    });
    
    self.socket.on('response dimension', function(data) {
      self.cols = data.cols;
      self.rows = data.rows;

      self.world_cols.innerHTML =data.cols;
      self.world_rows.innerHTML =data.rows;

      self.cell_border = 1;
      self.cell_size = 0 - self.cell_border + Math.min(
        Math.floor((self.width - self.cell_border) / self.cols),
        Math.floor((self.height - self.cell_border) / self.rows));

      self.drawSpace();
      self.socket.emit('request init');
    });
    
    self.socket.on('change state', function(data) {
      self.changeElementState(data.state);
    });

    self.socket.on('change space', function(data) {
      var cells = data.cells || [];
      
      if (self.clear_space && (cells.length > 0)) {
        self.drawSpace();
      }

      for(var k=0; k<cells.length; k++) {
        if (!self.clear_space || (cells[k].v > 0)) {
          self.drawCell(cells[k].x, cells[k].y, cells[k].v);  
        }
      }

      self.clear_space = false;

      self.status_totalsteps.innerHTML = (data.totalsteps) ? data.totalsteps : '-';
      self.status_alivecells.innerHTML = (data.alivecells) ? data.alivecells : '-';

      data.perf = data.perf || {};
      self.status_time_usage.innerHTML = 
          (data.perf.time_usage) ? data.perf.time_usage : '-';

      var mem = (data.perf.memory_usage) ? data.perf.memory_usage : '0';
      mem = parseInt(mem) / 1024;
      self.status_memory_usage.innerHTML = mem;
    });

    self.socket.emit('request dimension');
  }

  GolClient.prototype.drawSpace = function() {
    this.context.fillStyle = 'lightgray';
    this.context.fillRect(0, 0, this.width, this.height);

    for (var i = 0 ; i < this.cols; i++) {
      for (var j = 0 ; j < this.rows; j++) {
        this.drawCell(i, j, -1);
      }
    }
  }

  GolClient.prototype.drawCell = function(i, j, alive) {
    this.context.fillStyle = (alive == 0) ? 'darkgray' : 
        ((alive==1) ? 'green' : 'white');
    this.context.fillRect(
      this.cell_border + (this.cell_border + this.cell_size) * i, 
      this.cell_border + (this.cell_border + this.cell_size) * j, 
      this.cell_size, this.cell_size);
  }

  GolClient.prototype.changeElementState = function(state) {
    var stopped = (state === 0);
    this.button_start.disabled = !stopped;
    this.button_stop.disabled = stopped;
    this.button_step.disabled = !stopped;
    this.button_reset.disabled = !stopped;
    this.button_random.disabled = !stopped;
    this.checkbox_toroidal.disabled = !stopped;
    this.pattern_list.disabled = !stopped;
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

  exports.GolClient = GolClient;

})(this);

var gol = new GolClient();

gol.registerEvent(window, 'load', function() {
  gol.init();
});
