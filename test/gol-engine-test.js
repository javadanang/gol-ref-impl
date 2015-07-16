var assert = require('chai').assert;
var GOL = require('../lib/gol-engine.js');
var golUtil = require('../lib/gol-util.js');

describe('Test GOL constructor & methods', function() {
  it('Test Constructor, getCols() & getRows()', function() {
    var dims = [[10, 20], [15, 25], [1, 1]];
    dims.forEach(function(dim, index) {
      var gol = new GOL({cols: dim[0], rows: dim[1]});
      assert(dim[0] === gol.getCols(), 'Return value of gol.getCols() is not correct');
      assert(dim[1] === gol.getRows(), 'Return value of gol.getRows() is not correct');
    });
  });

  it('Test Constructor with a matrix as the parameter', function() {
    var mat = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];

    var gol = new GOL({ matrix: mat });

    var dim = golUtil.getMatrixDimension(mat);

    assert(dim.cols === gol.getCols(), 'Return value of gol.getCols() is not correct');
    assert(dim.rows === gol.getRows(), 'Return value of gol.getRows() is not correct');

    for(var i=0; i<dim.rows; i++) {
      for(var j=0; j<dim.cols; j++) {
        assert(mat[i][j] == gol.getCell(j, i),
          'cell[' + i + ',' + j + '] value is not correct');
      }
    }
  });

  it('Test Constructor with a list of cells as the parameter', function() {
    var cells = [
      {x:0, y:0, v:1},
      {x:1, y:1, v:1},
      {x:2, y:2, v:1},
      {x:3, y:3, v:1},
      {x:4, y:4, v:1},
    ];

    var matrix = [
      [1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0],
    ];

    var dim = golUtil.getMatrixDimension(matrix);
    var gol = new GOL({ cols:dim.cols, rows:dim.rows, cells:cells });

    assert(gol.getCols() === dim.cols, 'Return value of gol.getCols() is incorrect');
    assert(gol.getRows() === dim.rows, 'Return value of gol.getRows() is incorrect');

    for(var i=0; i<dim.rows; i++) {
      for(var j=0; j<dim.cols; j++) {
        assert(matrix[i][j] == gol.getCell(j, i),
          'cell[' + i + ',' + j + '] value is incorrect');
      }
    }
  });
});