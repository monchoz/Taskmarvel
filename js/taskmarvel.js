document.addEventListener('DOMContentLoaded', function () {
    var speakerStream, micStream = new MediaStream;
    var recorder, micRecorder;
    
    const recordedChunks = [];
    const recordButton = document.getElementById("recordBtn");
    const stopButton = document.getElementById("stopBtn");
    const downloadButton = document.getElementById("downloadBtn");
    const audioPlayer = document.getElementById("audio");
    const audioContainer = document.getElementById("audioContainer");
    const instructions = document.getElementById("instructions");

    recordButton.addEventListener('click', (() => window.location.reload()));

    const handleSuccess = function (stream) {
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = evt => recordedChunks.push(evt.data);

        recorder.addEventListener('stop', function () {
            const audio = URL.createObjectURL(new Blob(recordedChunks));
            audioContainer.classList.remove("hidden");
            downloadButton.href = audio
            downloadButton.download = `Taskmarvel_recording_${Date.now().toString()}.wav`;
            audioPlayer.src = audio;
            stopButton.classList.add("hidden");
            recordButton.classList.remove("hidden");
            instructions.classList.remove("hidden");
        });

        stopButton.addEventListener('click', function () {
            downloadButton.classList.remove("hidden");
            stopMicRecord();
            recorder.stop();
            stream.getVideoTracks().forEach(track => track.stop());
        });

        recorder.start();
    };

    const mergeStream = () => {
        var OutgoingAudioMediaStream = new MediaStream();
        OutgoingAudioMediaStream.addTrack(speakerStream.getAudioTracks()[0]);

        var IncomingAudioMediaStream = new MediaStream();
        IncomingAudioMediaStream.addTrack(micStream.getAudioTracks()[0]);

        const audioContext = new AudioContext();

        audioIn_01 = audioContext.createMediaStreamSource(OutgoingAudioMediaStream);
        audioIn_02 = audioContext.createMediaStreamSource(IncomingAudioMediaStream);

        dest = audioContext.createMediaStreamDestination();

        audioIn_01.connect(dest);
        audioIn_02.connect(dest);

        var finalStream = dest.stream;

        handleSuccess(finalStream);
    }

    const stopMicRecord = () => micRecorder.stop();

    const handleTracks = function (stream) {
        if (!stream.getAudioTracks().length){
            alert("Make sure to enable sharing system audio");
            recordButton.classList.remove("hidden");
            return;
        }
        speakerStream = stream;
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                micStream = stream;
                micRecorder = new MediaRecorder(micStream);
                micRecorder.start();
                stopButton.classList.remove("hidden");
                instructions.classList.add("hidden");
                // stopping and removing the video track to enhance the performance
                speakerStream.getVideoTracks()[0].stop();
                speakerStream.removeTrack(speakerStream.getVideoTracks()[0]);
                mergeStream();
            });
    }

    if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        })
            .then(stream => handleTracks(stream))
            .catch((e) => {
                console.error('Failed', e.message);
                stopButton.classList.add("hidden");
                recordButton.classList.remove("hidden");
            });
    } else if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        })
            .then(stream => handleTracks(stream))
            .catch((e) => {
                console.error('Failed', e.message);
                stopButton.classList.add("hidden");
                recordButton.classList.remove("hidden");
            });
    }
}, false);