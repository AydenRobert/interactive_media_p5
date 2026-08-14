// for keeping state of variables in between frames
// very ugly way to keep state, but oh well
let prevPower = -1;

// resolution basically
// i.e. 10 -> each "pixel" rendered turns into a 10x10 square
const cellSize = 10;
const halfCellSize = Math.floor(cellSize / 2);
// amount of times z_{n+1}^2 = z_n^2 + c is run
const maxIterations = 100;

function setup() {
    createCanvas(floor(windowWidth * 0.9), floor(windowHeight * 0.9));
    colorMode(HSB, 360, 100, 100, 255);
    noStroke();
}

function draw() {
    rectMode(CENTER);

    // maps mouse cursor to power and scale
    const power = map(mouseX, 0, width, 1, 3);

    // if the power is the same, no need to rerender...
    if (prevPower === power) {
        return;
    }

    // set the new power
    prevPower = power;
    const imageScale = map(mouseY, 0, height, 1000, 100);

    // go through the main loop
    // y is outside loop for cache reasons
    // (probably doesn't make a difference with js)
    for (let pY = 0; pY < height; pY += cellSize) {
        for (let pX = 0; pX < width; pX += cellSize) {
            // get the complex representation of the coords
            const c = screenToPlane(
                pX + cellSize / 2,
                pY + cellSize / 2,
                imageScale
            );

            // check which iteration it escaped on
            const iteration = escapeTime(
                c.re,
                c.im,
                maxIterations,
                power
            );

            // map the iteration to a hue
            const imageHue = map(iteration, 0, maxIterations - 1, 0, 360);

            // if max iterations, fill black
            // therefore it didn't escape
            if (iteration === maxIterations) {
                fill(0, 0, 0);
            } else {
                fill(imageHue, 85, 100);
            }

            // draw the motif...
            drawMotif(pX + halfCellSize, pY + halfCellSize);
        }
    }
}

function drawMotif(pX, pY) {
    rect(pX, pY, halfCellSize - 2, cellSize - 2);
    rect(pX, pY, cellSize - 2, halfCellSize - 2);
}

// Turns pixel coords into complex plane coords
function screenToPlane(pX, pY, imageScale) {
    const x = (pX - floor(width / 2)) - (imageScale - 100);
    const y = -(pY - floor(height / 2));

    return {
        re: x / imageScale,
        im: y / imageScale
    };
}

// Runs the mathematical function z_{n+1}^2 = z_n^2 + c
// returns based on |z^2| > 4 or maxIterations
function escapeTime(cr, ci, maxIterations, power) {
    let zr = 0;
    let zi = 0;

    const halfPower = power * 0.5;

    for (let i = 0; i < maxIterations; i++) {
        // turn it into euler form
        // makes the formula general
        const radiusSquared = zr * zr + zi * zi;
        const magnitude = Math.pow(radiusSquared, halfPower);
        const angle = Math.atan2(zi, zr) * power;

        zr = magnitude * Math.cos(angle) + cr;
        zi = magnitude * Math.sin(angle) + ci;

        if (zr * zr + zi * zi > 4) {
            return i;
        }
    }

    return maxIterations;
}
