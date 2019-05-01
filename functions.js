

function getAdjacentPixels(index, pixelData){
    let adjPixels = [];

    adjPixels.push(index - width*4 - 4)
    adjPixels.push(index - width*4)
    adjPixels.push(index - width*4 + 4)
    adjPixels.push(index - 4);
    adjPixels.push(index);
    adjPixels.push(index + 4);
    adjPixels.push(index + width*4 - 4);
    adjPixels.push(index + width*4);
    adjPixels.push(index + width*4 + 4);
    console.log(adjPixels)
    return adjPixels;
}


function getAveragePixelColor(arr, pixelData){
    let rSum = 0;
    let bSum = 0;
    let gSum = 0;
    for(pixelIndex of arr){
        // console.log(pixelData)
        rSum += pixelData.data[pixelIndex]
        gSum += pixelData.data[pixelIndex + 1]
        bSum += pixelData.data[pixelIndex + 2]
    }
    // console.log(rSum)
    return [rSum/arr.length, bSum/arr.length, gSum/arr.length]
}
let pixelData;



