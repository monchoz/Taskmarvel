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
    const transcription = document.getElementById("transcription");
    const loader = document.getElementById("loader");

    recordButton.addEventListener('click', (() => window.location.reload()));

    const fileUpload = (blob, fileName) => {
        let form = new FormData();
        loader.classList.remove("hidden");
        form.append('file', blob, fileName);
        form.append('title', fileName);
        //fetch('http://35.209.90.43:80/api/upload', {
        fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: form
        })
        .then(response => response.json())
        .then(data => {
            if (!data.results.length) {
                transcription.innerHTML = "No words found";
            } else {
                // filter words when channel = 1
                const words = data.results.filter(word => word.channel_tag === 1);
                words.forEach(word => {
                    transcription.innerHTML += `${word.alternatives[0].transcript} \n\n`;
                });
            }
            loader.classList.add("hidden");
        })
        .catch(err => {
            console.error(err);
            loader.classList.add("hidden");
            alert("Unable to transcribe");
        });
    }

    const handleSuccess = function (stream) {
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = evt => recordedChunks.push(evt.data);

        recorder.addEventListener('stop', function () {
            const fileName = `Taskmarvel_recording_${Date.now().toString()}.wav`;
            const audioBlob = new Blob(recordedChunks);
            const audio = URL.createObjectURL(audioBlob);
            audioContainer.classList.remove("hidden");
            downloadButton.href = audio
            downloadButton.download = fileName;
            audioPlayer.src = audio;
            stopButton.classList.add("hidden");
            recordButton.classList.remove("hidden");
            // Upload audio file to retrieve transcription
            fileUpload(audioBlob, fileName);
        });

        stopButton.addEventListener('click', function () {
            stopRecording();
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

    const stopRecording = () => {
        downloadButton.classList.remove("hidden");
        stopMicRecord();
        recorder.stop();
    }

    const handleTracks = function (stream) {
        if (!stream.getAudioTracks().length){
            alert("Make sure to enable sharing system audio");
            recordButton.classList.remove("hidden");
            return;
        }
        speakerStream = stream;
        speakerStream.getVideoTracks()[0].addEventListener('ended', () => stopRecording())
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                micStream = stream;
                micRecorder = new MediaRecorder(micStream);
                micRecorder.start();
                stopButton.classList.remove("hidden");
                instructions.classList.add("hidden");
                mergeStream();
            });
    }

    if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 48000
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
                sampleRate: 48000
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