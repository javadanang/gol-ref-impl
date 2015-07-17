var _ = require('lodash');
var golUtil = require('../lib/gol-util.js');

function GameOfLife(params) {
  params = params || {};
  if (Object.keys(params).length == 0) {
    params.cols = 5;
    params.rows = 5;
  }
  this.init(params);
}

GameOfLife.prototype.init = function(params) {
  params = params || {};

  this._activemark = 0;
  this._totalsteps = 0;
  this._alivecells = 0;

  if (params.matrix) {
    var dim = golUtil.getMatrixDimension(params.matrix);
    if (!dim.cols || !dim.rows) {
      throw new Error('Invalid matrix: ' + JSON.stringify(params));
    }
    this._rows = dim.rows;
    this._cols = dim.cols;

    this._space = new Array(this._rows);
    for(var i=0; i<this._rows; i++) {
      this._space[i] = new Array(this._cols);
      for(var j=0; j<this._cols; j++) {
        this._space[i][j] = [params.matrix[i][j], 0];
      }
    }
  } else

  if (params.cols && params.rows) {
    this._cols = params.cols;
    this._rows = params.rows;

    this._space = new Array(this._rows);
    for(var i=0; i<this._rows; i++) {
      this._space[i] = new Array(this._cols);
      for(var j=0; j<this._cols; j++) {
        this._space[i][j] = [0, 0];
      }
    }
    this.seed(params.cells);
  } else
    
  throw new Error('Invalid parameters: ' + JSON.stringify(params));
}

GameOfLife.prototype.seed = function(cells) {
  cells = cells || [];

  for(var k=0; k<cells.length; k++) {
    var x = cells[k].x;
    var y = cells[k].y;
    if (0 <= x && x < this._cols && 0 <= y && y < this._rows) {
      this._space[y][x][this._activemark] = cells[k].v;
    }
  }
}

GameOfLife.prototype.getTotalSteps = function() {
  return this._totalsteps;
}

GameOfLife.prototype.getAliveCells = function() {
  return this._alivecells;
}

GameOfLife.prototype.getCols = function() {
  return this._cols;
}

GameOfLife.prototype.getRows = function() {
  return this._rows;
}

GameOfLife.prototype.getCell = function(col, row) {
  return this._space[row][col][this._activemark];
}

GameOfLife.prototype.next = function() {
}

module.exports = GameOfLife;