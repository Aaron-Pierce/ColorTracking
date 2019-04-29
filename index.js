let width;
let height;

class Pixel{
    constructor(r,g,b){
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

    const track = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
    imageCapture.getPhotoCapabilities().then(result => {
        console.log(result)
        console.log(result.imageWidth.max < window.innerWidth)
        if(result.imageWidth.max < window.innerWidth){
            width = result.imageWidth.max;
            height = result.imageHeight.max;
        }else{
            console.log("width greater than window innerwidth")
            let cameraAspectRatio = result.imageHeight.max / result.imageWidth.max;
            console.log(cameraAspectRatio)
            width = 0.95 * window.innerWidth;
            // width = (width<result.imageWidth.min) ? result.imageWidth.min : width;
            console.log(width)
            height = cameraAspectRatio * width;
            // height = (height<result.imageHeight.min) ? result.imageHeight.min : height;
        }
        document.querySelector('canvas').width = width;
        document.querySelector('canvas').height = height;
        document.body.append(`Max: ${result.imageWidth.max}, ${result.imageHeight.max}. Min: ${result.imageWidth.min}, ${result.imageHeight.min}`)
        drawImageToCanvas();
        return imageCapture.getPhotoCapabilities();
    })
});


let desiredColor = [0,0,255]
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
    let clickedPixel = inputCtx.getImageData(x,y,1,1).data
    desiredColor = clickedPixel;
    document.querySelector("#colorSwatch").style.backgroundColor = `rgba(${desiredColor[0]},${desiredColor[1]},${desiredColor[2]},${desiredColor[3]})`
}

document.querySelector('canvas').addEventListener('click', function(event){
    getCursorPosition(document.querySelector('canvas'), event)
})


let inputCtx = document.querySelector('canvas').getContext('2d');

let lastPixel = {
    x: 0,
    y: 0,
    distanceFromRed: 9999,
};


let reddestPixel = {
    x: 0,
    y: 0,
    distanceFromRed: 9999,
};


function colorDistanceFromDesired(r, g, b){
    return Math.sqrt(Math.pow((desiredColor[0]-r), 2) + Math.pow((desiredColor[1]-g), 2) + Math.pow((desiredColor[2]-b), 2))
}

let pixelData;
function drawImageToCanvas() {
    inputCtx.drawImage(document.querySelector('video'), 0, 0, width, height);



    pixelData = inputCtx.getImageData(0, 0, width, height);

    for(let i = 0; i < pixelData.data.length; i += 4){
        let redValue = pixelData.data[i];
        let greenValue = pixelData.data[i+1];
        let blueValue = pixelData.data[i+2];
        let dist = colorDistanceFromDesired(redValue, greenValue, blueValue)
        // console.log(dist)
        if(dist < reddestPixel.distanceFromRed){
            let pixelIndex = Math.ceil(i/4);
            let tx = pixelIndex % width;
            let ty = Math.ceil(pixelIndex / (width));
            // if(Math.hypot(lastPixel.x - tx, lastPixel.y - ty) < 50){
                reddestPixel.x = tx;
                reddestPixel.y = ty;
            // }
            
            reddestPixel.distanceFromRed = dist;
        }

    }

    // inputCtx.putImageData( pixelData, 0, 0 );

    let index = reddestPixel.index;
    inputCtx.fillStyle = 'green';
    inputCtx.beginPath();

    inputCtx.ellipse(reddestPixel.x, reddestPixel.y, 20, 20, 0, 0, 2*3.14);
    inputCtx.fill();


    // console.log(reddestPixel)

    reddestPixel = {
        x: 0,
        y: 0,
        distanceFromRed: 9999,
    };

    requestAnimationFrame(drawImageToCanvas)
}


