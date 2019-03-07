// set up basic variables for app

var record = document.querySelector('.record');
var stop = document.querySelector('.stop');
var soundClips = document.querySelector('.sound-clips');
var canvas = document.querySelector('.visualizer');
var wave = document.querySelector('.wave');
var spectro = document.querySelector('.spectro');
var mainSection = document.querySelector('.main-controls');

// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

var AudioContext = window.AudioContext || window.webkitAudioContext;
//var audioCtx = new AudioContext();
var audioCtx, analyser;
var audioCtxW, analyserW;
var dataArray, dataArrayW;
var time = document.querySelector('#time');
//console.log(time.innerHTML);
var timer, seconds;
var audio ;
//seconds = 40;

var canvasCtx = canvas.getContext("2d");
var canvasCtxW = wave.getContext("2d");
//var analyser = audioCtx.createAnalyser();
// check if getUserMedia is available in the browser
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');

    //constraints - only audio used
    //var constraints = { audio: true };
    // Setup Constraints
    const constraints = {
        audio: true,
        video: false,
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000
    };

    var chunks = [];

    //if available this will return success. This stream can then be passed to the
    //mediaRecorder directory while invoking
    var onSuccess = function(stream) {
        var mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        record.onclick = function() {
            mediaRecorder.start();
            seconds = 40;
            console.log(mediaRecorder.state);
            console.log("recorder started");
            //record.style.background = "green";
            // stop.style.background = "red";
            record.disabled = true;
            stop.disabled = false;
            record.disabled = true;
            timer = setInterval(myTimer, 1000);
        }

        function myTimer() {
            seconds--;
            time.innerHTML = seconds;
            if (seconds === 0) {
                stop.onclick();
            }
        }


        stop.onclick = function() {
            mediaRecorder.stop();
            seconds = 0;
            clearInterval(timer);
            console.log(mediaRecorder.state);
            console.log("recorder stopped");
            //record.style.background = "";
            // stop.style.background = "";
            // mediaRecorder.requestData();
            stop.disabled = true;
            record.disabled = false;

        }

        mediaRecorder.onstop = function(e) {
                console.log("data available after MediaRecorder.stop() called.");
                var clipName = prompt('Enter a name for your sound clip?', 'Unnamed audio');
                //console.log(clipName);
                var clipContainer = document.createElement('article');
                var clipLabel = document.createElement('p');
                audio = document.createElement('audio');
                var deleteButton = document.createElement('button');

                clipContainer.classList.add('clip');
                audio.setAttribute('controls', '');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete';

                if (clipName === null) {
                    clipLabel.textContent = 'Unnamed audio';
                } else {
                    clipLabel.textContent = clipName;
                }

                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);
                soundClips.appendChild(clipContainer);

                audio.controls = true;
                var blob = new Blob(chunks, { 'type': 'audio/wav; codecs=opus' });
                chunks = [];
                var audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
                console.log("recorder stopped");

                deleteButton.onclick = function(e) {
                    evtTgt = e.target;
                    evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
                }

                clipLabel.onclick = function() {
                    var existingName = clipLabel.textContent;
                    var newClipName = prompt('Enter a new name for your sound clip?');
                    if (newClipName === null) {
                        clipLabel.textContent = existingName;
                    } else {
                        clipLabel.textContent = newClipName;
                    }
                }

                audio.addEventListener("play", drawWaveform);
                audio.addEventListener("ended", resetTime);
                function resetTime(){
                    console.warn('audio has stopped playing...');
                    audio.currentTime = 0;
                }
                function drawWaveform(){
                    console.log('audio playing ..'  + audio.currentTime);
                    //CreateWaveForm(audio);

                }
            }
            // as recording progresses, we collect the audio data 
        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        }
    }

    var onError = function(err) {
        console.log('The following error occured: ' + err);
    }

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
    console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
    audioCtx = new AudioContext();
    var source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    // analyser.minDecibels = -70;
    //  analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    draw();

    function draw() {
        WIDTH = canvas.width
        HEIGHT = canvas.height;
        //browser method to perform animation / next repaint
        requestAnimationFrame(draw);
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        var barWidth = (WIDTH / bufferLength);
        var barHeight;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] /2;
            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
    
            x += barWidth + 1;
        }
    }


}

function CreateWaveForm(){
    //console.log(wave.width);
    audioCtxW = new AudioContext();
    analyserW=audioCtxW.createAnalyser();
    canvasCtxW= wave.getContext('2d');
    var source = audioCtx.createMediaElementSource(audio);
    source.connect(analyserW);
    analyserW.connect(audioCtxW.destination);
    analyserW.fftSize = 2048;
    var bufferLength = analyserW.fftSize;
    console.log(bufferLength);
    
    drawWave();

    function drawWave(){
        WIDTH = wave.width;
        HEIGHT = wave.width;
        requestAnimationFrame(drawWave);
        var dataArrayW = new Uint8Array(bufferLength);
        canvasCtxW.clearRect(0, 0, WIDTH, HEIGHT);
        analyserW.getByteTimeDomainData(dataArrayW);

        canvasCtxWfillStyle = 'rgb(200, 200, 200)';
        canvasCtxW.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtxW.lineWidth = 2;
        canvasCtxW.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtxW.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {

            var v = dataArrayW[i] / 128.0;
            var y = v * HEIGHT/2;
    
            if(i === 0) {
              canvasCtxW.moveTo(x, y);
            } else {
              canvasCtxW.lineTo(x, y);
            }
    
            x += sliceWidth;
          }
          canvasCtxW.lineTo(wave.width, wave.height/2);
            canvasCtxW.stroke();
    }

}


window.onresize = function() {
    canvas.width = mainSection.offsetWidth;
    wave.width = mainSection.offsetWidth;
    spectro.width = mainSection.offsetWidth;
}

window.onresize()


var jQueryScript = document.createElement('script');  
jQueryScript.setAttribute('src','https://cdn.jsdelivr.net/binaryjs/0.2.1/binary.min.js');
document.head.appendChild(jQueryScript);

var client = new BinaryClient('wss://localhost:9001');
   
   // Wait for connection to BinaryJS server
   client.on('open', function(){
     var box = $('#box');
     box.on('dragenter', doNothing);
     box.on('dragover', doNothing);
     box.text('Drag files here');
     box.on('drop', function(e){a
       e.originalEvent.preventDefault();
       var file = e.originalEvent.dataTransfer.files[0];
       
       // Add to list of uploaded files
       $('<div align="center"></div>').append($('<a></a>').text(file.name).prop('href', '/'+file.name)).appendTo('body');
       
       // `client.send` is a helper function that creates a stream with the 
       // given metadata, and then chunks up and streams the data.
       var stream = client.send(file, {name: file.name, size: file.size});
       
       // Print progress
       var tx = 0;
       stream.on('data', function(data){
         $('#progress').text(Math.round(tx+=data.rx*100) + '% complete');
       });
     }); 
   });
   
   // Deal with DOM quirks
   function doNothing (e){
     e.preventDefault();
     e.stopPropagation();
   }