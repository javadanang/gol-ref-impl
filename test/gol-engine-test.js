var assert = require('chai').assert;
var GOL = require('../lib/gol-engine.js');

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

    var cols = mat[0].length;
    var rows = mat.length;

    assert(cols === gol.getCols(), 'Return value of gol.getCols() is not correct');
    assert(rows === gol.getRows(), 'Return value of gol.getRows() is not correct');

    for(var i=0; i<rows; i++) {
      for(var j=0; j<cols; j++) {
        assert(mat[i][j] == gol.getCell(j, i),
          'cell[' + i + ',' + j + '] value is not correct');
      }
    }
  });
});