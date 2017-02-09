var hyperlog = require('hyperlog');
var React = require('react');
var ReactDOM = require('react-dom');
var memdown = require('memdown');
var fruitdown = require('fruitdown');
var levelup = require('levelup');
var async = require('async');

var e = React.createElement;

function addItems(log) {
  async.waterfall([
    function(done) {
      log.add(null, Date.now() + 'a', done);
    },
    function(node, done) {
      log.add([node.key], 'b', done);
    },
    function(node, done) {
      log.add([node.key], 'c', done);
    }
  ], function(err) {
    if (err) throw err;
    console.log('done adding');
  });
}

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

var db = levelup('todoList', {db: fruitdown});
var log = hyperlog(db, {valueEncoding: 'json'});

var container = document.getElementById('container');

ReactDOM.render(e(TodoList, {log: log}), container);
addItems(log);
