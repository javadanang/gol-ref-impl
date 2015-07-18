var GOL = require('./lib/gol-engine.js');
var golPatterns = require('./lib/gol-patterns.js');

var gol = new GOL({ cols: 40, rows: 25, 
  cells: golPatterns['Gosper-glider-gun'].cells
});

gol.on('change', function(changes, perf) {
  console.log('Step #' + gol.getTotalSteps() + ' / Alive cells: ' + gol.getAliveCells());
  console.log('Time/Memory usage: ' + JSON.stringify(perf));
})

var display = function() {
  var cols = gol.getCols();
  var rows = gol.getRows();
  for(var i=0; i<rows; i++) {
    for(var j=0; j<cols; j++) {
      process.stdout.write(gol.getCell(j,i) ? ' x' : ' .');
    }
    process.stdout.write('\n');
  }
}

setInterval(function() {
  gol.next();
  display();
}, 50);
