var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello, this is a server....')
  res.end();
}).listen(8000);


console.log('http server has (presumably) started on port 8000');