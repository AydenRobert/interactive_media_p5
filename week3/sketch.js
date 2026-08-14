let prevPower = -1;
const step = 10;
const maxIterations = 100;

function setup() {
    createCanvas(floor(windowWidth * 0.9), floor(windowHeight * 0.9));
    colorMode(HSB, 360, 100, 100, 255);
    noStroke();
}

function draw() {
    const power = map(mouseX, 0, width, 1, 3);

    if (prevPower == power) {
        return;
    }

    prevPower = power;

    for (let pY = 0; pY < height; pY += step) {
        for (let pX = 0; pX < width; pX += step) {
            const c = screenToPlane(pX + step / 2, pY + step / 2);
            const iteration = escapeTime(c.re, c.im, maxIterations, power);

            const hue = map(iteration, 0, maxIterations - 1, 0, 360);

            if (iteration === maxIterations) {
                fill(0, 0, 0);
            } else {
                fill(hue, 85, 100);
            }

            square(pX, pY, step, step);
        }
    }
}

function screenToPlane(pX, pY, scale) {
    const x = pX - floor(width / 2);
    const y = -(pY - floor(height / 2));

    return {
        re: x / 400,
        im: y / 400
    };
}

function escapeTime(cr, ci, maxIterations, power) {
    let zr = 0;
    let zi = 0;

    const halfPower = power * 0.5;

    for (let i = 0; i < maxIterations; i++) {
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
};
