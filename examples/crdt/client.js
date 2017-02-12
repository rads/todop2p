var hyperlog = require('hyperlog');
var crdt = require('crdt');
var cuid = require('cuid');
var React = require('react');
var ReactDOM = require('react-dom');
var websocket = require('websocket-stream');
var sortBy = require('sort-by');
var shuffle = require('shuffle-array');

var e = React.createElement;

var TodoList = React.createClass({
  getInitialState: function() {
    return {items: []};
  },

  componentDidMount: function() {
    var seq = this.props.seq;

    seq.on('move', function(row) {
      var items = seq.toJSON().sort(sortBy('_sort'));
      this.setState({items: items});
    }.bind(this));
  },

  render: function() {
    var items = this.state.items.map(function(item) {
      return e('li', {key: item.id}, JSON.stringify(item, null, 2));
    });

    return e('ol', null, items);
  }
});

var doc = new crdt.Doc();
var seq = doc.createSeq('type', 'todoList');

var stream = doc.createStream();
var ws = websocket('ws://' + location.host);
stream.pipe(ws).pipe(stream);

var i = 0;
var container = document.getElementById('container');

ReactDOM.render(e(TodoList, {seq: seq}), container);
document.onclick = function() {
  var value = (doc.id + ' ' + i++);
  var row = {id: cuid(), type: 'todoList', value: value};
  if ((i % 2) === 0) {
    seq.before(row, seq.at(0));
  } else {
    seq.after(row, seq.at(seq.length() - 1));
  }
};

window.shuffleItems = function() {
  var arr = [];
  while (seq.length() > 0) {
    arr.push(seq.shift());
  }
  arr = shuffle(arr);
  while (arr.length > 0) {
    seq.push(arr.shift());
  }
}
