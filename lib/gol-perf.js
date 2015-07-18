function Perf() {
  this.time = Date.now();
}

Perf.prototype.stop = function() {
  return {
    time_usage: Date.now() - this.time,
    memory_usage: process.memoryUsage().rss
  }
}

module.exports = Perf;