var _ = require('lodash');

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

  if (params.matrix) {
    var dim = golUtil.getMatrixDimension(params.matrix);
    if (!dim.cols || !dim.rows) {
      throw new Error('Invalid matrix: ' + JSON.stringify(params));
    }
    this._rows = dim.rows;
    this._cols = dim.cols;
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
}

module.exports = GameOfLife;