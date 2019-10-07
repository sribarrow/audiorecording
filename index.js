// index.js

//console.log(IMAGENET_CLASSES[15]) // => "This is a test!"

let express = require('express');
let https = require('https');
let binaryServer = require('binaryjs').BinaryServer;
let opener = require('opener');
let fs = require('fs');
let wav = require('wav');
let outFile;

// set the app to access all express variables
let app = express();
// port our node JS will listen into
let port = 3000;

app.use(function(req, res, next){
    console.log(`${new Date()} - ${req.method} request for ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
//var wsport = 9001;

app.use('/assets', express.static('./assets/'));

//routing
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/spectro.html', function(req, res) {
    res.sendFile(__dirname + '/spectro.html');
});

app.get('/predict.html', function(req, res) {
    res.sendFile(__dirname + '/predict.html');
});
//app.get('');

// set the app to listen to the port.
app.listen(port, function(){
    console.log('Serving on port 3000...');
});


var options = {
    port: 9001,
    key:    fs.readFileSync('./assets/ssl/localhost.key'),
    cert:   fs.readFileSync('./assets/ssl/localhost.crt')
};

if(!fs.existsSync("./assets/audio"))
    fs.mkdirSync("./assets/audio");

    var httpServer = https.createServer(options,app);
    httpServer.listen(options.port);
    
   // opener("https://localhost:9001");

 var server = binaryServer({server:httpServer});

 server.on('connection', function(client) {
    console.log("new connection...");
    var fileWriter = null;
    var writeStream = null;

    client.on('stream', function(stream, meta) {

        console.log("Stream Start@" + meta.sampleRate +"Hz");
        console.log("Writing to file " + meta.fname+"_"+ new Date().getTime());
        var fileName = "./assets/audio/"+ meta.fname +"_"+ new Date().getTime();
        //console.log(fileName);
              
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