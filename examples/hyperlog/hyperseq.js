var sortBy = require('sort-by');
var cuid = require('cuid');
var between = require('between');

function Hyperseq(log) {
  this.log = log;
  this.head = null;
  this.sorted = [];

  var stream = this.log.createReadStream({live: true});

  stream.on('data', function(node) {
    if (node.value._sort) {
      this.sorted.push(node);
      this.sorted.sort(sortBy('value._sort'));
    } else if (node.value.shift) {
      this.sorted.shift();
    }
  }.bind(this));
}

Hyperseq.prototype._add = function(item, lo, hi, done) {
  var row = {
    id: cuid(),
    item: item,
    _sort: between(lo, hi)
  };

  var afterAdd = function(err, node) {
    if (err) return done(err);
    this.head = node;
    done(null);
  }.bind(this);

  var links = this.head ? [this.head.key] : [];

  this.log.add(links, row, {}, afterAdd);
};

Hyperseq.prototype.push = function(item, done) {
  var lo = this.sorted.length ? this.sorted[this.sorted.length - 1].value._sort : between.lo;
  var hi = between.hi;
  this._add(item, lo, hi, done);
};

Hyperseq.prototype.before = function(node, item, done) {
  var idx = this.sorted.findIndex(function(r) {
    return node && r.value.id === node.value.id;
  });
  var lo = this.sorted[idx-1] ? this.sorted[idx-1].value._sort : between.lo;
  var hi = this.sorted[idx] ? this.sorted[idx].value._sort : between.hi;
  this._add(item, lo, hi, done);
};

Hyperseq.prototype.after = function(node, item, done) {
  var idx = this.sorted.findIndex(function(r) {
    return node && r.value.id === node.value.id;
  });
  var lo = this.sorted[idx] ? this.sorted[idx].value._sort : between.lo;
  var hi = this.sorted[idx+1] ? this.sorted[idx+1].value._sort : between.hi;
  this._add(item, lo, hi, done);
};

Hyperseq.prototype.shift = function(done) {
  var links = this.head ? [this.head.key] : [];
  this.log.add(links, {shift: true}, function(err, node) {
    if (err) return done(err);
    this.head = node;
    done(null);
  });
  return this.sorted[0];
};

function hyperseq(log) {
  return new Hyperseq(log);
}

module.exports = hyperseq;
