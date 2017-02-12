var hyperlog = require('hyperlog');
var RArray = require('r-array');
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

    seq.on('update', function() {
      var items = seq.toJSON();
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

var seq = new RArray();

var stream = seq.createStream();
var ws = websocket('ws://' + location.host);
stream.pipe(ws).pipe(stream);

var i = 0;
var container = document.getElementById('container');

ReactDOM.render(e(TodoList, {seq: seq}), container);
document.onclick = function() {
  var value = (seq.id + ' ' + i++);
  var row = {id: cuid(), type: 'todoList', value: value};
  if ((i % 2) === 0) {
    seq.splice(0, 0, row);
  } else {
    seq.splice(seq.length, 0, row);
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
