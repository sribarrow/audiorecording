var express = require('express');
var https = require('https');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');
var outFile;

// set the app to access all express variables
var app = express();
// port our node JS will listen into
var port = 3000;
var wsport = 9001;
app.use('/assets', express.static('./assets/'));
//routing
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// set the app to listen to the port.
app.listen(port);

var options = {
    key:    fs.readFileSync('./assets/ssl/localhost.key'),
    cert:   fs.readFileSync('./assets/ssl/localhost.crt'),
};

if(!fs.existsSync("./assets/audio"))
    fs.mkdirSync("./assets/audio");

var server = https.createServer(options,app);
server.listen(wsport);

//var binaryServer = new BinaryServer({port: 9001});

server.on('connection', function(client) {
    console.log("new connection...");
    var fileWriter = null;
    var writeStream = null;

    client.on('stream', function(steam, meta){
        console.log("Stream Start@" + meta.sampleRate +"Hz");
        var fileName = "recordings/"+ meta.name +"-"+ new Date().getTime();

        fileWriter = new wav.FileWriter(fileName + ".wav", {
            channels: 1,
            sampleRate: meta.sampleRate,
            bitDepth: 16 });
        
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
