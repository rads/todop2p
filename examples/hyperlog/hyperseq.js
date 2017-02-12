var cuid = require('cuid');

function Hyperseq(log) {
  this.log = log;
  this.head = null;
  this.sorted = [];
  this.length = 0;
  this.seqID = cuid();

  var stream = this.log.createReadStream({live: true});

  stream.on('data', function(node) {
    this.head = node;
    if (node.value.seqID === this.seqID) return;
    this._applyCommit(node.value);
  }.bind(this));
}

Hyperseq.prototype._applyCommit = function(commit) {
  var result, data, args;

  switch (commit.action) {
    case 'splice':
      data = commit.data;
      args = [data.start, data.deleteCount].concat(data.items ? data.items : []);
      result = this.sorted.splice.apply(this.sorted, args);
      break;
  }

  this.length = this.sorted.length;

  return result;
};

Hyperseq.prototype.splice = function(start, deleteCount, items, done) {
  if (!done) done = function(){};
  var item = {start: start, deleteCount: deleteCount, items: items};
  return this._commit('splice', item, done);
};

Hyperseq.prototype._commit = function(action, data, done) {
  var links = this.head ? [this.head.key] : null;
  var commit = {seqID: this.seqID, action: action, data: data};
  this.log.add(links, commit, {}, done);
  return this._applyCommit(commit);
};

Hyperseq.prototype.push = function(item) {
  var length = this.sorted.length;
  this.splice(length, 0, [item]);
  return length + 1;
};

Hyperseq.prototype.shift = function() {
  return this.splice(0, 1);
};

function hyperseq(log) {
  return new Hyperseq(log);
}

module.exports = hyperseq;
