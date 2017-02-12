var websocket = require('websocket-stream');
var http = require('http');
var express = require('express');
var cuid = require('cuid');

var app = express();
var server = http.createServer(app);

var streams = {};

var wss = websocket.createServer({server: server}, function(stream) {
  var id = cuid();

  Object.keys(streams).forEach(function(key) {
    var s = streams[key];
    s.pipe(stream).pipe(s);
  });

  stream.on('end', function() {
    delete streams[id];
  });

  streams[id] = stream;
  console.log(Object.keys(streams));
});

app.use(express.static('public'));

server.listen(3000);
