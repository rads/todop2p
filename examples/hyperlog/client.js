var hyperlog = require('hyperlog');
var React = require('react');
var ReactDOM = require('react-dom');
var memdown = require('memdown');
var fruitdown = require('fruitdown');
var levelup = require('levelup');
var async = require('async');
var websocket = require('websocket-stream');
var JSONStream = require('JSONStream');
var between = require('between');
var hyperseq = require('./hyperseq');
var shuffle = require('shuffle-array');
var cuid = require('cuid');

var e = React.createElement;

var TodoList = React.createClass({
  getInitialState: function() {
    return {items: []};
  },

  componentDidMount: function() {
    var log = this.props.log;

    log.createReadStream({live: true}).on('data', function(node) {
      this.setState({items: this.props.seq.sorted});
    }.bind(this));
  },

  render: function() {
    var items = this.state.items.map(function(item) {
      return e('li', {key: item.key}, JSON.stringify(item, null, 2));
    });

    return e('ul', null, items);
  }
});

var db = levelup('todoList', {db: memdown});
var log = hyperlog(db, {valueEncoding: 'json', id: String(Date.now())});

var ws = websocket('ws://' + location.host);
var replicator = log.replicate({live: true, frame: false});
replicator.pipe(ws).pipe(replicator);

var container = document.getElementById('container');

function render(props) {
  ReactDOM.render(e(TodoList, props), container);
}

var i = 0;
var seq = hyperseq(log);

document.onclick = function() {
  seq.push(log.id + ' ' + i++, function(err){
    if (err) throw err;
    render({log: log, seq: seq});
  });
};

document.onclick = function() {
  var item = {key: cuid(), value: (seq.id + ' ' + i++)};
  if ((i % 2) === 0) {
    seq.splice(0, 0, [item]);
  } else {
    seq.splice(seq.sorted.length, 0, [item]);
  }
};

window.shuffleItems = function() {
  var arr = [];
  while (seq.length > 0) {
    arr.push(seq.shift());
  }
  arr = shuffle(arr);
  while (arr.length > 0) {
    seq.push(arr.shift());
  }
}

render({log: log, seq: seq});
