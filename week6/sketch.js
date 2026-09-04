let speedSlider;
let heightSlider;

let terrainOffsetX = 0;
let terrainOffsetY = 0;

let overworldPalette;
let hellPalette;
let activePalette;

const canvasWidth = 800;
const canvasHeight = 560;
const cellSize = 5;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);

  overworldPalette = new TerrainPalette("OVERWORLD", {
    deepWater: [8, 37, 76],
    shallowWater: [18, 93, 132],
    beach: [224, 197, 123],
    lowland: [75, 137, 73],
    highland: [43, 91, 57],
    rock: [112, 109, 98],
    peak: [239, 242, 239],
    uiAccent: [70, 180, 255],
  });

  hellPalette = new TerrainPalette("HELL", {
    deepWater: [24, 0, 8],
    shallowWater: [78, 5, 10],
    beach: [156, 27, 12],
    lowland: [193, 54, 15],
    highland: [104, 14, 13],
    rock: [62, 8, 17],
    peak: [255, 190, 78],
    uiAccent: [255, 77, 30],
  });

  activePalette = overworldPalette;

  speedSlider = new Slider({
    x: 30,
    y: height - 35,
    width: 220,
    height: 16,
    min: 0,
    max: 0.08,
    value: 0.02,
    label: "Movement speed",
    orientation: "horizontal",
  });

  heightSlider = new Slider({
    x: width - 35,
    y: 60,
    width: 16,
    height: 220,
    min: 0.2,
    max: 2.4,
    value: 1.1,
    label: "Terrain height",
    orientation: "vertical",
  });
}

function draw() {
  background(10, 10, 16);

  const speed = speedSlider.getValue();
  const terrainHeight = heightSlider.getValue();

  terrainOffsetX += speed;
  terrainOffsetY += speed * 0.35;

  drawTerrain(terrainHeight);
  drawInterface();
}

function drawTerrain(terrainHeight) {
  noStroke();

  const noiseScale = 0.018;
  const usableWidth = width - 70;
  const usableHeight = height - 70;

  for (let x = 0; x < usableWidth; x += cellSize) {
    for (let y = 0; y < usableHeight; y += cellSize) {
      const noiseX = x * noiseScale + terrainOffsetX;
      const noiseY = y * noiseScale + terrainOffsetY;

      const rawNoise = noise(noiseX, noiseY);

      let elevation = 0.5 + (rawNoise - 0.5) * terrainHeight;
      elevation = constrain(elevation, 0, 1);

      fill(activePalette.getTerrainColor(elevation));
      rect(x, y, cellSize, cellSize);
    }
  }
}

function drawInterface() {
  noStroke();
  fill(0, 175);
  rect(0, height - 70, width, 70);

  fill(255);
  textAlign(LEFT, TOP);
  textSize(16);
  text("Moving Perlin Noise Terrain", 30, height - 64);

  textSize(12);
  fill(220);
  text(
    `Speed: ${speedSlider.getValue().toFixed(3)}`,
    30,
    height - 16,
  );

  text(
    `Height: ${heightSlider.getValue().toFixed(2)}`,
    285,
    height - 16,
  );

  speedSlider.display(activePalette.uiAccent);
  heightSlider.display(activePalette.uiAccent);

  drawPresetButton(
    410,
    height - 45,
    125,
    27,
    overworldPalette,
  );

  drawPresetButton(
    545,
    height - 45,
    125,
    27,
    hellPalette,
  );
}

function drawPresetButton(x, y, buttonWidth, buttonHeight, palette) {
  const isActive = activePalette === palette;
  const isHovering =
    mouseX >= x &&
    mouseX <= x + buttonWidth &&
    mouseY >= y &&
    mouseY <= y + buttonHeight;

  if (isActive) {
    fill(palette.uiAccent);
  } else if (isHovering) {
    fill(90);
  } else {
    fill(45);
  }

  stroke(isActive ? 255 : 120);
  strokeWeight(1);
  rect(x, y, buttonWidth, buttonHeight, 4);

  noStroke();
  fill(isActive ? 20 : 235);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(palette.name, x + buttonWidth / 2, y + buttonHeight / 2);
}

function mousePressed() {
  speedSlider.mousePressed(mouseX, mouseY);
  heightSlider.mousePressed(mouseX, mouseY);

  if (isInsideRectangle(mouseX, mouseY, 410, height - 45, 125, 27)) {
    activePalette = overworldPalette;
  }

  if (isInsideRectangle(mouseX, mouseY, 545, height - 45, 125, 27)) {
    activePalette = hellPalette;
  }
}

function mouseDragged() {
  speedSlider.mouseDragged(mouseX, mouseY);
  heightSlider.mouseDragged(mouseX, mouseY);
}

function mouseReleased() {
  speedSlider.mouseReleased();
  heightSlider.mouseReleased();
}

function keyPressed() {
  if (key === "1") {
    activePalette = overworldPalette;
  }

  if (key === "2") {
    activePalette = hellPalette;
  }
}

function isInsideRectangle(px, py, x, y, rectangleWidth, rectangleHeight) {
  return (
    px >= x &&
    px <= x + rectangleWidth &&
    py >= y &&
    py <= y + rectangleHeight
  );
}

class TerrainPalette {
  constructor(name, colors) {
    this.name = name;

    this.deepWater = color(...colors.deepWater);
    this.shallowWater = color(...colors.shallowWater);
    this.beach = color(...colors.beach);
    this.lowland = color(...colors.lowland);
    this.highland = color(...colors.highland);
    this.rock = color(...colors.rock);
    this.peak = color(...colors.peak);
    this.uiAccent = color(...colors.uiAccent);
  }

  getTerrainColor(elevation) {
    if (elevation < 0.38) {
      return this.deepWater;
    }

    if (elevation < 0.46) {
      return this.shallowWater;
    }

    if (elevation < 0.5) {
      return this.beach;
    }

    if (elevation < 0.64) {
      return this.lowland;
    }

    if (elevation < 0.76) {
      return this.highland;
    }

    if (elevation < 0.9) {
      return this.rock;
    }

    return this.peak;
  }
}

class Slider {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;

    this.min = options.min;
    this.max = options.max;
    this.label = options.label || "";
    this.orientation = options.orientation || "horizontal";

    this.percentage = map(
      options.value,
      this.min,
      this.max,
      0,
      1,
      true,
    );

    this.dragging = false;
  }

  getValue() {
    return map(this.percentage, 0, 1, this.min, this.max);
  }

  getKnobPosition() {
    if (this.orientation === "horizontal") {
      return {
        x: lerp(this.x, this.x + this.width, this.percentage),
        y: this.y + this.height / 2,
      };
    }

    return {
      x: this.x + this.width / 2,
      y: lerp(this.y + this.height, this.y, this.percentage),
    };
  }

  isMouseOver(mouseX, mouseY) {
    const padding = 10;

    return (
      mouseX >= this.x - padding &&
      mouseX <= this.x + this.width + padding &&
      mouseY >= this.y - padding &&
      mouseY <= this.y + this.height + padding
    );
  }

  mousePressed(mouseX, mouseY) {
    if (this.isMouseOver(mouseX, mouseY)) {
      this.dragging = true;
      this.updateFromMouse(mouseX, mouseY);
    }
  }

  mouseDragged(mouseX, mouseY) {
    if (this.dragging) {
      this.updateFromMouse(mouseX, mouseY);
    }
  }

  mouseReleased() {
    this.dragging = false;
  }

  updateFromMouse(mouseX, mouseY) {
    if (this.orientation === "horizontal") {
      this.percentage = map(
        mouseX,
        this.x,
        this.x + this.width,
        0,
        1,
        true,
      );
    } else {
      this.percentage = map(
        mouseY,
        this.y + this.height,
        this.y,
        0,
        1,
        true,
      );
    }
  }

  display(accentColor) {
    const knob = this.getKnobPosition();
    const hovering = this.isMouseOver(mouseX, mouseY);

    stroke(200);
    strokeWeight(3);
    strokeCap(ROUND);

    if (this.orientation === "horizontal") {
      line(
        this.x,
        this.y + this.height / 2,
        this.x + this.width,
        this.y + this.height / 2,
      );

      stroke(accentColor);
      line(
        this.x,
        this.y + this.height / 2,
        knob.x,
        knob.y,
      );
    } else {
      line(
        this.x + this.width / 2,
        this.y,
        this.x + this.width / 2,
        this.y + this.height,
      );

      stroke(accentColor);
      line(
        this.x + this.width / 2,
        this.y + this.height,
        knob.x,
        knob.y,
      );
    }

    noStroke();

    if (this.dragging) {
      fill(255, 205, 75);
    } else if (hovering) {
      fill(180, 230, 255);
    } else {
      fill(255);
    }

    circle(knob.x, knob.y, 18);
  }
}
