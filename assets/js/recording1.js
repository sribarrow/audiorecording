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
                var audio = document.createElement('audio');
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