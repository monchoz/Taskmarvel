document.addEventListener('DOMContentLoaded', function () {
    var speaker = new MediaStream;
    var IncomingAudioMediaStream = new MediaStream();

    var micMediaRecorder;
    const recordedChunks = [];
    const micRecordedChunks = [];
    const recordButton = document.getElementById("recordBtn");
    const stopButton = document.getElementById("stopBtn");
    const downloadButton = document.getElementById("downloadBtn");
    const audioPlayer = document.getElementById("audio");
    const audioContainer = document.getElementById("audioContainer");
    const instructions = document.getElementById("instructions");

    recordButton.addEventListener('click', (() => window.location.reload()));

    const handleSuccess = function (stream) {
        const options = { mimeType: 'audio/webm' };
        const mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.addEventListener('dataavailable', function (e) {
            if (e.data.size > 0) recordedChunks.push(e.data);
        });

        mediaRecorder.addEventListener('stop', function () {

            /*const audioContext = new AudioContext();

            audioIn_01 = audioContext.createMediaStreamSource(speaker);
            audioIn_02 = audioContext.createMediaStreamSource(IncomingAudioMediaStream);

            const dest = audioContext.createMediaStreamDestination();

            audioIn_01.connect(dest);
            audioIn_02.connect(dest);

            var FinalStream = dest.stream;

            console.log(FinalStream.getAudioTracks())*/
            
            const videoBuff = new Blob(recordedChunks);
            const micBuff = new Blob(micRecordedChunks);

            concatenateBlobs([videoBuff, micBuff], "audio/wav", function(blob) {
                const audio = URL.createObjectURL(blob);
                audioContainer.classList.remove("hidden");
                downloadButton.href = audio
                downloadButton.download = `Taskmarvel_recording_${Date.now().toString()}.wav`;
                audioPlayer.src = audio;
                stopButton.classList.add("hidden");
                recordButton.classList.remove("hidden");
                instructions.classList.remove("hidden");
            });
        });

        stopButton.addEventListener('click', function () {
            downloadButton.classList.remove("hidden");
            micMediaRecorder.stop();
            mediaRecorder.stop();
            // TODO: Stop stream
            stream.getVideoTracks().forEach(track => track.stop());
        });

        mediaRecorder.start();
    };

    function recordMic() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                micMediaRecorder = new MediaRecorder(stream);
                micMediaRecorder.start();
                IncomingAudioMediaStream.addTrack(stream.getAudioTracks()[0].clone());

                micMediaRecorder.addEventListener("dataavailable", e => {
                    micRecordedChunks.push(e.data);
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
        instructions.classList.add("hidden");
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