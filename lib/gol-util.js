var _ = require('lodash');

var _object = {};

_object.getMatrixDimension = function(matrix) {
  var dim = {};
  
  if (!_.isArray(matrix)) return dim;
  if (matrix.length == 0) return dim;
  dim.rows = matrix.length;

  for(var i=0; i<dim.rows; i++) {
    if (!_.isArray(matrix[i])) return dim;
    if (i > 0) {
      if (matrix[i].length != matrix[0].length) return dim;
    }
  }
  if (matrix[0].length == 0) return dim;
  dim.cols = matrix[0].length;

  return dim;
}

module.exports = _object;