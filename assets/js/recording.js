//canvas
let canvas = document.querySelector('.visualizer');
let canvasCtx = canvas.getContext("2d");
//wave
let wave = document.querySelector('.wave');
let wavCtx = wave.getContext("2d");

//div
let mainSection = document.querySelector('.main-controls');
let soundClips = document.querySelector('.sound-clips');
// buttons
let record = document.querySelector('.record');
let stop = document.querySelector('.stop');
//audio variables
let audioContext, wavContext, spContext;
let audioInput, analyser;

//resampleRate, worker,
let  bStream, client, recorder;
// boolean
let bRecording = false;

let spH, spW, sph, spx, DATA, LEN;

let filename = '';

let session = {
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
    let mediaRecorder = new MediaRecorder(stream);
    audioContext = new AudioContext();
    let contextSampleRate = audioContext.sampleRate;
    
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
    let bufferSize = 1024;
    // create a javascript no de
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
        filename= document.getElementById('filename').value;
        mediaRecorder.start();
        seconds = 40;
        record.disabled = true;
        stop.disabled = false;
        record.disabled = true;
        //record.addClass('disabled');
        timer = setInterval(myTimer, 1000);
        client = new BinaryClient('wss://localhost:9001');
            client.on('open', function () {
            bStream = client.createStream({sampleRate: contextSampleRate, fname: filename
            });
            //console.log(bStream);
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
    let left = e.inputBuffer.getChannelData(0);

    //worker.postMessage({cmd: "resample", buffer: left});

    console.log('audio streaming...');
    if(bRecording){
        console.log('Recording now...');
        if (bStream && bStream.writable){
           // console.log(left);
            bStream.write(convertFloat32ToInt16(left));
        } 
    }
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    
    let barWidth = (WIDTH / bufferLength)+2;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] /2;
        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
   
      drawWave(bufferLength, dataArray);
  }

  function drawWave(bufferL, data){
    wave.width = mainSection.offsetWidth;
    let WIDTH = wave.width;
    let HEIGHT = wave.height;
    wavCtx.clearRect(0, 0, WIDTH, HEIGHT);
    analyser.getByteTimeDomainData(data);
    wavCtx.fillStyle = 'pink';
    wavCtx.fillRect(0, 0, WIDTH, HEIGHT);
    wavCtx.lineWidth = 2;
    wavCtx.strokeStyle = 'rgb(0, 0, 0)';
    wavCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferL;
    let x = 0;

    for(let i = 0; i < bufferL; i++) {
   
      let v = data[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        wavCtx.moveTo(x, y);
      } else {
        wavCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }
      wavCtx.lineTo(wave.width, wave.height/2);
      wavCtx.stroke();
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

