var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello, this is a server....')
  res.end();
});

server.on('error', function(err) {
	console.error('Problem listening on port 8000!!! Not running, exiting now!!');
	console.error('Err msg: ' + err.message);
	console.error('Stack trace: ' + err.stack);
	process.exit(1);
})

server.listen(8000, function() {
	var port = server.address().port;
	console.log('This http server things it started on port 8000 but in reality it started on port: ' + port);
});
