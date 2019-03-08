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
// boolean
var bRecording = false;
var client = new BinaryClient('wss://localhost:9001');
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
    audioInput = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    var bufferSize = 2048;
    // create a javascript node
    var recorder = audioContext.createScriptProcessor(bufferSize, 1, 1);

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
        if(mediaRecorder.state === 'recording'){
            return;
        } else{
            mediaRecorder.start();
            seconds = 40;
            console.log(mediaRecorder.state);
            record.disabled = true;
            stop.disabled = false;
            record.disabled = true;
            //record.addClass('disabled');
            timer = setInterval(myTimer, 1000);
            bRecording = true
        }   
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
        if (mediaRecorder.state==='inactive') {
            console.log('Recorder is inactive..');
        } else {
            mediaRecorder.stop;
            seconds = 0;
            clearInterval(timer);
            console.log(mediaRecorder.state);
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

    console.log('audio streaming...');
    if(bRecording){
        console.log('Recording now...');
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

  function onError(err) {
    console.log('The following error occured: ' + err);
}

