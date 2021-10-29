function concatenateBlobs(blobs, type, callback) {
    var buffers = [];

    var index = 0;

    function readAsArrayBuffer() {
        if (!blobs[index]) {
            return concatenateBuffers();
        }
        var reader = new FileReader();
        reader.onload = function (event) {
            buffers.push(event.target.result);
            index++;
            readAsArrayBuffer();
        };
        reader.readAsArrayBuffer(blobs[index]);
    }

    readAsArrayBuffer();


    function audioLengthTo32Bit(n) {
        n = Math.floor(n);
        var b1 = n & 255;
        var b2 = (n >> 8) & 255;
        var b3 = (n >> 16) & 255;
        var b4 = (n >> 24) & 255;

        return [b1, b2, b3, b4];
    }
    function concatenateBuffers() {
        var byteLength = 0;
        buffers.forEach(function (buffer) {
            byteLength += buffer.byteLength;
        });

        var tmp = new Uint8Array(byteLength);
        var lastOffset = 0;
        var newData;
        buffers.forEach(function (buffer) {
            if (type == 'audio/wav' && lastOffset > 0) newData = new Uint8Array(buffer, 44);
            else newData = new Uint8Array(buffer);
            tmp.set(newData, lastOffset);
            lastOffset += newData.length;
        });
        if (type == 'audio/wav') {
            tmp.set(audioLengthTo32Bit(lastOffset - 8), 4);
            tmp.set(audioLengthTo32Bit(lastOffset - 44), 40); // update audio length in the header
        }
        var blob = new Blob([tmp.buffer], {
            type: type
        });
        callback(blob);

    }
}