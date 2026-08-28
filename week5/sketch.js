let maxDepth = 5;
let splitAngle = 25;

const minZoom = 0.25;
const maxZoom = 4;

let colorPicker;
let colors = [];
let triangles = [];
let triangleLayer;

let centerX;
let centerY;
let radius;
let startingAngle;

let offsetX;
let offsetY;
let previousMouseX;
let previousMouseY;
let zoom = 1;

function setup() {
    createCanvas(800, 800);

    // create a colour picker to set primary colour
    colorPicker = createColorPicker("#e07a42");
    colorPicker.position(20, 20);

    colorMode(HSB, 360, 100, 100);
    noStroke();
    angleMode(RADIANS);

    // create a layer to draw triangle graphics onto
    triangleLayer = createGraphics(width, height);
    triangleLayer.noStroke();

    // variables for main triangle
    centerX = width / 2;
    centerY = height / 2 + 35;
    radius = 310;
    startingAngle = -HALF_PI;

    // variables for moving mouse
    offsetX = 0;
    offsetY = 0;
    previousMouseX = -1;
    previousMouseY = -1;

    // generate initial triangles
    regenerateTriangles();
}

function draw() {
    drawBackground();

    updatePanOffset();
    updateColors();

    drawInstructions();
    renderTriangles();
}

function keyPressed() {
    if (key === "r" || key === "R") {
        // when r is pressed, regenerate structures and randomise colours
        regenerateTriangles();

        colorPicker.elt.value = color(
            random(10, 255),
            random(10, 255),
            random(10, 255)
        ).toString();
    } else if (key === "." || key === ">") {
        // when > is pressed, increase depth
        if (maxDepth >= 8) {
            return;
        }

        maxDepth++;
        regenerateTriangles();
    } else if (key === "," || key === "<") {
        // when < is pressed, decrease depth
        if (maxDepth <= 0) {
            return;
        }

        maxDepth--;
        regenerateTriangles();
    }
}

function mouseWheel(event) {
    // on mouseWheel event, change zoom
    const zoomSpeed = 0.001;

    zoom *= 1 - event.delta * zoomSpeed;
    zoom = constrain(zoom, minZoom, maxZoom);

    return false;
}

function drawBackground() {
    const stripeSpacing = 70;
    const stripeWidth = 18;
    const stripeSpeed = 0.5;
    const stripeOffset = (frameCount * stripeSpeed) % stripeSpacing;

    background(10, 10, 10);

    push();

    stroke(20, 20, 20);
    strokeWeight(stripeWidth);

    // draw all the stripes
    let x = -height - stripeSpacing;
    for (; x < width + stripeSpacing; x += stripeSpacing) {
        line(x - stripeOffset, 0, x + height - stripeOffset, height);
    }

    pop();
}

function regenerateTriangles() {
    // empty the triangles global
    triangles = [];

    // generate the system
    generateTriangleSystem(
        centerX,
        centerY,
        radius,
        startingAngle,
        0
    );
}

function generateTriangleSystem(x, y, radius, rotation, depth) {
    // get outer triangle details
    const outerTriangle = getTriangleVertices(x, y, radius, rotation);

    triangles.push({
        v: outerTriangle,
        c: floor(random(3))
    });

    if (depth >= maxDepth) {
        return;
    }

    // randomise if inner triangle is generated
    if (round(random(maxDepth - depth)) !== 0) {
        // get iner triangle details
        const innerTriangle = getTriangleVertices(
            x,
            y,
            radius * 0.5,
            rotation + PI
        );

        triangles.push({
            v: innerTriangle,
            c: 4
        });
    }

    // call recursively
    const childRadius = radius * 0.5;

    for (let i = 0; i < 3; i++) {
        const childX = lerp(x, outerTriangle[i].x, 0.5);
        const childY = lerp(y, outerTriangle[i].y, 0.5);

        generateTriangleSystem(
            childX,
            childY,
            childRadius,
            rotation,
            depth + 1
        );
    }
}

function getTriangleVertices(x, y, radius, rotation) {
    const vertices = [];

    // for each of the 3 vertices of a triangle
    for (let i = 0; i < 3; i++) {
        // get the rotation of the vertex
        const angle = rotation + (TWO_PI / 3) * i;

        // centre + unit_circle_offset * r
        vertices.push({
            x: x + cos(angle) * radius,
            y: y + sin(angle) * radius
        });
    }

    return vertices;
}

function updateColors() {
    const selectedColor = color(colorPicker.value());

    // if new colour, update the split colours
    if (!colorsAreEqual(selectedColor, colors[0])) {
        colors[0] = selectedColor;
        updateSplitColors();
    }
}

function updateSplitColors() {
    const baseColor = colors[0];
    const baseHue = hue(baseColor);
    const baseSaturation = saturation(baseColor);
    const baseBrightness = brightness(baseColor);
    // get the complementary hue
    const complementaryHue = normalizeHue(baseHue + 180);

    colors[1] = color(
        // offset complementary hue
        normalizeHue(complementaryHue - splitAngle),
        baseSaturation,
        baseBrightness
    );

    colors[2] = color(
        // offset complementary hue
        normalizeHue(complementaryHue + splitAngle),
        baseSaturation,
        baseBrightness
    );
}

// i just thought it would be cool if the triangle could render over the
// background/text, thus the extra layer
function renderTriangles() {
    // clear the triangleLayer canvas
    triangleLayer.clear();
    triangleLayer.noStroke();

    triangleLayer.push();

    // zoom into centre of canvas
    triangleLayer.translate(width / 2, height / 2);
    triangleLayer.scale(zoom);
    triangleLayer.translate(-width / 2, -height / 2);

    for (let i = 0; i < triangles.length; i++) {
        // get the data
        const triangleData = triangles[i];
        const vertices = triangleData.v;

        // check if colouring or removing
        if (triangleData.c < 4) {
            triangleLayer.fill(colors[triangleData.c]);
            triangleLayer.noErase();
        } else {
            triangleLayer.erase();
        }

        // draw the triangle
        triangleLayer.triangle(
            vertices[0].x + offsetX,
            vertices[0].y + offsetY,
            vertices[1].x + offsetX,
            vertices[1].y + offsetY,
            vertices[2].x + offsetX,
            vertices[2].y + offsetY
        );
    }

    triangleLayer.pop();

    // draw the triangle
    image(triangleLayer, 0, 0);
}

function updatePanOffset() {
    // if pressing the left mouse button
    if (mouseButton.left) {
        // check if this is the first frame
        if (previousMouseX === -1) {
            previousMouseX = mouseX;
            previousMouseY = mouseY;
            return;
        }

        // if not, pan the triangle
        const mouseDifferenceX = mouseX - previousMouseX;
        const mouseDifferenceY = mouseY - previousMouseY;

        previousMouseX = mouseX;
        previousMouseY = mouseY;

        offsetX += mouseDifferenceX * 0.5 * (1 / zoom);
        offsetY += mouseDifferenceY * 0.5 * (1 / zoom);
    } else if (previousMouseX !== -1) {
        // if not pressing the left mouse button
        // reset prev values
        previousMouseX = -1;
        previousMouseY = -1;
    }
}

function drawInstructions() {
    push();

    fill(255);
    textSize(30);
    textStyle(BOLD);

    text("Press 'r' to randomsise.", 20, height - 20);
    text("Depth: " + maxDepth + " ( , and  . )", 20, height - 60);

    pop();
}

// is there not a color .equal function?
// idk i couldn't seem to use one
function colorsAreEqual(firstColor, secondColor) {
    return (
        red(firstColor) === red(secondColor) &&
        green(firstColor) === green(secondColor) &&
        blue(firstColor) === blue(secondColor) &&
        alpha(firstColor) === alpha(secondColor)
    );
}

function normalizeHue(hueValue) {
    return (hueValue + 360) % 360;
}
