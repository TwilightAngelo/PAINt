var express = require('express');
var app = express();
var parser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var path = [];

io.on('connection', function(socket){
  socket.emit('new', path);
  console.log('user connected');
  socket.on('send', function(msg){
    console.log(msg);
    path.push(msg);
    socket.broadcast.emit('update', msg);
  });
});


http.listen(42042, function() {
	console.log('im online');
});