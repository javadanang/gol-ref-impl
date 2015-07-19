var _ = require('lodash');
var os = require('os');

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

_object.getServerIps = function(networkMap) {
  var networkInterfaces = networkMap || os.networkInterfaces();
  var networkObjs = _.flattenDeep(_.values(networkInterfaces));
  return _.transform(networkObjs, function(result, obj) {
    if (obj.family === 'IPv4') result.push(obj.address);
  });
}

module.exports = _object;