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
  } else
    
  throw new Error('Invalid parameters: ' + JSON.stringify(params));
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

module.exports = GameOfLife;