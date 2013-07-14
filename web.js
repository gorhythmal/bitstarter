var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('oye varta, tere kitne nambar aaye??!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
