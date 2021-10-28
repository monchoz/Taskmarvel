document.addEventListener('DOMContentLoaded', function () {
    var speaker = new MediaStream;
    var micMediaRecorder;
    const recordedChunks = [];
    const recordButton = document.getElementById("recordBtn");
    const stopButton = document.getElementById("stopBtn");
    const downloadButton = document.getElementById("downloadBtn");
    const audioPlayer = document.getElementById("audio");
    const audioContainer = document.getElementById("audioContainer");

    recordButton.addEventListener('click', (() => window.location.reload()));

    const handleSuccess = function (stream) {
        const options = { mimeType: 'audio/webm' };
        const mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.addEventListener('dataavailable', function (e) {
            if (e.data.size > 0) recordedChunks.push(e.data);
        });

        mediaRecorder.addEventListener('stop', function () {
            var audio = URL.createObjectURL(new Blob(recordedChunks));
            audioContainer.classList.remove("hidden");
            downloadButton.href = audio
            downloadButton.download = `Taskmarvel_recording_${Date.now().toString()}.wav`;
            audioPlayer.src = audio;
        });

        stopButton.addEventListener('click', function () {
            downloadButton.classList.remove("hidden");
            mediaRecorder.stop();
            micMediaRecorder.stop();
            // TODO: Stop stream
        });

        mediaRecorder.start();
    };

    function recordMic() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const options = { mimeType: 'audio/webm' };
                micMediaRecorder = new MediaRecorder(stream, options);
                micMediaRecorder.start();

                micMediaRecorder.addEventListener("dataavailable", e => {
                    recordedChunks.push(e.data);
                });
            });
    }

    const handleTracks = function (speaker, stream) {
        if (!stream.getAudioTracks().length){
            alert("Make sure to enable sharing system audio");
            recordButton.classList.remove("hidden");
            return;
        } 
        recordMic();
        stopButton.classList.remove("hidden");
        speaker.addTrack(stream.getAudioTracks()[0].clone());
        // stopping and removing the video track to enhance the performance
        stream.getVideoTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
        handleSuccess(stream);
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
            .then(stream => handleTracks(speaker, stream))
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
            .then(stream => handleTracks(speaker, stream))
            .catch((e) => {
                console.error('Failed', e.message);
                stopButton.classList.add("hidden");
                recordButton.classList.remove("hidden");
            });
    }
}, false);