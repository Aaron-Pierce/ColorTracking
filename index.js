let width;
let height;

class Pixel {
    constructor(r, g, b) {
        this.red = r;
        this.gren = g;
        this.blue = b;
    }
}

navigator.mediaDevices.getUserMedia({
        video: true
    })
    .then(mediaStream => {
        document.querySelector('video').srcObject = mediaStream;
        let trackId = 0;
        let track = mediaStream.getVideoTracks()[trackId];
        if(mediaStream.getVideoTracks().length > 1){
            document.querySelector('button').style = "display:auto"
            document.querySelector('button').addEventListener('click', function(){
                trackId = (trackId === 0) ? 1 : 0; 
                track = mediaStream.getVideoTracks()[trackId]
            })
        
        }
        imageCapture = new ImageCapture(track);
        imageCapture.getPhotoCapabilities().then(result => {

            console.log(result.imageWidth.max < window.innerWidth)
            if (result.imageWidth.max < window.innerWidth) {
                width = result.imageWidth.max;
                height = result.imageHeight.max;
            } else {
                console.log("width greater than window innerwidth")
                let cameraAspectRatio = result.imageHeight.max / result.imageWidth.max;

                width = Math.floor(0.95 * window.innerWidth);
                // width = (width<result.imageWidth.min) ? result.imageWidth.min : width;

                height = Math.floor(cameraAspectRatio * width);
                // height = (height<result.imageHeight.min) ? result.imageHeight.min : height;
            }
            document.querySelector('canvas').width = width;
            document.querySelector('canvas').height = height;
            document.body.append(`Max: ${result.imageWidth.max}, ${result.imageHeight.max}. Min: ${result.imageWidth.min}, ${result.imageHeight.min}`)
            drawImageToCanvas();
            return imageCapture.getPhotoCapabilities();
        })
    });


let desiredColor = [0, 0, 255]

function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    lastPixel.x = x;
    lastPixel.y = y;
    console.log("x: " + x + " y: " + y);
    let clickedPixel = inputCtx.getImageData(x, y, 1, 1).data
    desiredColor = clickedPixel;
    document.querySelector("#colorSwatch").style.backgroundColor = `rgba(${desiredColor[0]},${desiredColor[1]},${desiredColor[2]},${desiredColor[3]})`
}

document.querySelector('canvas').addEventListener('click', function (event) {
    getCursorPosition(document.querySelector('canvas'), event)
})


let inputCtx = document.querySelector('canvas').getContext('2d');

let lastPixel = {
    x: 0,
    y: 0,
    distanceFromRed: 9999,
};

let redPixels = [];


let reddestPixel = {
    x: 0,
    y: 0,
    distanceFromRed: 9999,
};


function colorDistanceFromDesired(r, g, b) {
    return Math.sqrt(Math.pow((desiredColor[0] - r), 2) + Math.pow((desiredColor[1] - g), 2) + Math.pow((desiredColor[2] - b), 2))
}

function drawImageToCanvas() {
    inputCtx.drawImage(document.querySelector('video'), 0, 0, width, height);



    pixelData = inputCtx.getImageData(0, 0, width, height);

    for (let i = 0; i < pixelData.data.length; i += 4) {

    //    let avgColors = getAveragePixelColor(getAdjacentPixels(i, pixelData), pixelData);
        // console.log(avgColors)
        let redValue = pixelData.data[i];
        let greenValue = pixelData.data[i + 1];
        let blueValue = pixelData.data[i + 2];
        let dist = colorDistanceFromDesired(redValue, greenValue, blueValue)
        
        if (dist < reddestPixel.distanceFromRed && dist < 50) {
            let pixelIndex = Math.ceil(i / 4);
            let tx = pixelIndex % width;
            let ty = Math.ceil(pixelIndex / (width));
            reddestPixel.x = tx;
            reddestPixel.y = ty;

            reddestPixel.distanceFromRed = dist;

            redPixels.push(Object.assign({}, reddestPixel))
            if (dist === 0) {
                break;
            }
        }

    }

    // inputCtx.putImageData( pixelData, 0, 0 );

    inputCtx.fillStyle = 'green';

    for (let i = 0; i < redPixels.length; i++) {
        for (let j = 1; j < redPixels.length - 1; j++) {
            let firstEl = redPixels[i];
            let secondEl = redPixels[j];
            if (firstEl.distanceFromRed + Math.pow(Math.hypot(lastPixel.x - firstEl.x, lastPixel.y - firstEl.y), 2) > secondEl.distanceFromRed + Math.pow(Math.hypot(lastPixel.x - secondEl.x, lastPixel.y - secondEl.y), 2)) {
                let temp = Object.assign({}, redPixels[j]);
                redPixels[j] = redPixels[i];
                redPixels[i] = temp;
            }
        }
    }



    // for (pixel of redPixels) {
    //     if (JSON.stringify(pixel) === JSON.stringify(reddestPixel)) {
    //         inputCtx.fillStyle = 'red';

    //     }else{
    //         inputCtx.fillStyle = 'green';
    //     }  
    //     inputCtx.beginPath();

    //     inputCtx.ellipse(pixel.x, pixel.y, 20, 20, 0, 0, 2 * 3.14);
    //     inputCtx.fill();
    // }

    if(redPixels.length !== 0){
        reddestPixel = redPixels[0]

        inputCtx.fillStyle = 'red';
        inputCtx.beginPath();
    
        inputCtx.ellipse(reddestPixel.x, reddestPixel.y, 20, 20, 0, 0, 2 * 3.14);
        inputCtx.fill();
    }


    lastPixel = Object.assign({}, reddestPixel)

    reddestPixel = {
        x: 0,
        y: 0,
        distanceFromRed: 9999,
    };

    redPixels = [];

    requestAnimationFrame(drawImageToCanvas)

}