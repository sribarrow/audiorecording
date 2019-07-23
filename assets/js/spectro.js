console.clear();

//spectrogram

let spectro = document.querySelector('.spectro');
let CTX=spectro.getContext("2d");

//audio variables
let audioContext;
let audioInput, analyser;

//resampleRate, worker,
let  bStream, client, recorder;
// boolean
let bRecording = false;

let H, W, h, x, DATA, LEN;

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
    
    audioInput = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    let bufferSize = 1024;
    // create a javascript no de
    // recorder = audioContext.createScriptProcessor(bufferSize, 1, 1);
    // analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 4096;
    audioInput.connect(analyser);
    //spectro.width = mainSection.offsetWidth;
    W = spectro.width;
    H = spectro.height;
    DATA = new Uint8Array(analyser.frequencyBinCount);
    LEN = DATA.length;
    h = H / LEN;
    x = W - 1;

    CTX.fillStyle = 'hsl(280, 100%, 10%)';
    CTX.fillRect(0, 0, W, H);

    drawSpectrogram();

    function drawSpectrogram(){
        
            window.requestAnimationFrame(drawSpectrogram);
            let imgData = CTX.getImageData(1, 0, W - 1, H);
            CTX.fillRect(0, 0, W, H);
            CTX.putImageData(imgData, 0, 0);
            analyser.getByteFrequencyData(DATA);
            for (let i = 0; i < LEN; i++) {
              let rat = DATA[i] / 255;
              let hue = Math.round((rat * 120) + 280 % 360);
              let sat = '100%';
              let lit = 10 + (70 * rat) + '%';
              CTX.beginPath();
              CTX.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
              CTX.moveTo(x, H - (i * h));
              CTX.lineTo(x, H - (i * h + h));
              CTX.stroke();
            }
    }
  }

  function onError(err) {
    console.log('The following error occured: ' + err);
}