var assert = require('chai').assert;
var golUtil = require('../../lib/gol-util.js');

describe('Test function getMatrixDimension()', function() {
  it('Test valid parameters', function() {
    var matrices = [
      [
        [0]
      ],
      [
        [0, 0, 0]
      ],
      [
        [0],
        [0],
        [0]
      ],
      [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    ];
    matrices.forEach(function(matrix, index) {
      var dim = golUtil.getMatrixDimension(matrix);
      assert(dim.cols === matrix[0].length && dim.rows === matrix.length,
        'getMatrixDimension() apply for ' +
        JSON.stringify(matrix) + ' is not correct');
    });
  });

  it('Test invalid parameters', function() {
    var dim = golUtil.getMatrixDimension('string');
    assert.isUndefined(dim.cols, 'cols value should be undefined');
    assert.isUndefined(dim.rows, 'rows value should be undefined');

    dim = golUtil.getMatrixDimension([0, 0, 1, 1]);
    assert.isUndefined(dim.cols, 'cols value should be undefined');
    assert.strictEqual(dim.rows, 4, 'rows value is not correct');
  });
});
