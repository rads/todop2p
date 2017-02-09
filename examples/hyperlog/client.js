var hyperlog = require('hyperlog');
var React = require('react');
var ReactDOM = require('react-dom');
var memdown = require('memdown');
var fruitdown = require('fruitdown');
var levelup = require('levelup');
var async = require('async');
var websocket = require('websocket-stream');
var JSONStream = require('JSONStream');

var e = React.createElement;

var TodoList = React.createClass({
  getInitialState: function() {
    return {items: []};
  },

  componentDidMount: function() {
    var log = this.props.log;

    log.createReadStream({live: true}).on('data', function(node) {
      var added = this.state.items.concat([node]);
      this.setState({items: added});
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

var i = 0;
var container = document.getElementById('container');

ReactDOM.render(e(TodoList, {log: log}), container);
document.onclick = function() {
  log.add(null, log.id + ' ' + i++);
};
