var express = require('express');
var https = require('https')
var binaryServer = require('binaryjs').BinaryServer;
var opener = require('opener');
var fs = require('fs');
var wav = require('wav');
var outFile;

// set the app to access all express variables
var app = express();
// port our node JS will listen into
var port = 3000;
//var wsport = 9001;
app.use('/assets', express.static('./assets/'));
//routing
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
// set the app to listen to the port.
app.listen(port);

var options = {
    port: 9001,
    key:    fs.readFileSync('./assets/ssl/localhost.key'),
    cert:   fs.readFileSync('./assets/ssl/localhost.crt')
};

if(!fs.existsSync("./assets/audio"))
    fs.mkdirSync("./assets/audio");

    var server = https.createServer(options,app);
    server.listen(options.port);

   // opener("https://localhost:9001");

 var server = binaryServer({server:server});

 server.on('connection', function(client) {
    console.log("new connection...");
    var fileWriter = null;
    var writeStream = null;

    client.on('stream', function(stream, meta) {

        console.log("Stream Start@" + meta.sampleRate +"Hz");
        var fileName = "./assets/audio/"+ meta.name +"_"+ new Date().getTime();
        console.log(fileName);
              
        fileWriter = new wav.FileWriter(fileName + ".wav", {
            channels: 1,
            sampleRate: meta.sampleRate,
            bitDepth: 32 });
        stream.pipe(fileWriter);
    });
    
    client.on('close', function() {
        if ( fileWriter != null ) {
            fileWriter.end();
        } else if ( writeStream != null ) {
            writeStream.end();
        }
        console.log("Connection Closed");
    });
});