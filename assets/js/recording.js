//canvas
var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var wave = document.querySelector('.wave');
var spectro = document.querySelector('.spectro');
//div
var mainSection = document.querySelector('.main-controls');
var soundClips = document.querySelector('.sound-clips');
// buttons
var record = document.querySelector('.record');
var stop = document.querySelector('.stop');
//audio variables
var audioContext, audioInput, analyser;
//resampleRate, worker,
var  bStream, client, recorder;
// boolean
var bRecording = false;

var session = {
    audio: true,
    video: false
  };

  //var recordRTC = null;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.getUserMedia(session, initializeRecorder, onError);
  } else{
    console.log('getUserMedia not supported on your browser!');
  }

  function initializeRecorder(stream) {
    console.log('accessing microphone...');
    var mediaRecorder = new MediaRecorder(stream);
    audioContext = new AudioContext();
    
    var contextSampleRate = audioContext.sampleRate;
        //resampleRate = contextSampleRate,
        //worker = new Worker('/assets/js/worker/resampler-worker.js');
        console.log(`Original sample rate:${contextSampleRate}`);

    // worker.postMessage({cmd:"init",from:contextSampleRate,to:resampleRate});

    // worker.addEventListener('message', function (e) {
    //     if (bStream && bStream.writable)
    //         bStream.write(convertFloat32ToInt16(e.data.buffer));
    // }, false);

    audioInput = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    var bufferSize = 2048;
    // create a javascript node
    recorder = audioContext.createScriptProcessor(bufferSize, 1, 1);

    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    // specify the processing function
    recorder.onaudioprocess = recorderProcess;
    // connect stream to our recorder
    //audioInput.connect(recorder);
    audioInput.connect(analyser);
    //connect analyser to recorder
    analyser.connect(recorder);
    // connect our recorder to the previous destination
    //recorder.connect(audioContext.destination);
    recorder.connect(audioContext.destination);
    record.onclick = function() {
        console.log(mediaRecorder.state);
        if(mediaRecorder.state === 'recording'){
            mediaRecorder.stop;
        } 
        mediaRecorder.start();
        seconds = 40;
        record.disabled = true;
        stop.disabled = false;
        record.disabled = true;
        //record.addClass('disabled');
        timer = setInterval(myTimer, 1000);
        client = new BinaryClient('wss://localhost:9001');
            client.on('open', function () {
            bStream = client.createStream({sampleRate: contextSampleRate
            });
        });
        bRecording = true
        
    }

    function myTimer() {
        seconds--;
        time.innerHTML = seconds;
        if (seconds === 0) {
            stop.onclick();
        }
    }

    stop.onclick = function() {
        //console.log(mediaRecorder.state==='inactive');
        if (mediaRecorder.state==='recording') {
            mediaRecorder.stop();
            console.log(mediaRecorder.state);
            seconds = 0;
            clearInterval(timer);
            console.log('Timer reset...');
            close();
            //console.log("recorder stopped");
            stop.disabled = true;
            record.disabled = false;
            bRecording = false;
        }
    }

  }

  function recorderProcess(e) {
    canvas.width = mainSection.offsetWidth;
    wave.width = mainSection.offsetWidth;
    spectro.width=mainSection.offsetWidth;

    var left = e.inputBuffer.getChannelData(0);

    //worker.postMessage({cmd: "resample", buffer: left});

    console.log('audio streaming...');
    if(bRecording){
        console.log('Recording now...');
        if (bStream && bStream.writable){
            bStream.write(convertFloat32ToInt16(left));
        } 
    }
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    var barWidth = (WIDTH / bufferLength)+2;
    var barHeight;
    var x = 0;
    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] /2;
        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
  }

  function convertFloat32ToInt16(buffer) {
    l = buffer.length;
    buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l])*0x7FFF;
    }
    return buf.buffer;
  }

  function close(){
    console.log('close');
    if(client)
        client.close();
}

  function onError(err) {
    console.log('The following error occured: ' + err);
}

