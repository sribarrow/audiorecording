var express = require('express');
// set the app to access all express variables
var app = express();
// port our node JS will listen into
var port = 3000;
app.use('/assets', express.static('./assets/'));
//routing
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


// set the app to listen to the port.
app.listen(port);