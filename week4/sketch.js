const arr_len = 100;
const step = 2;

let arr;
let offset;
let arr_filled;

function setup() {
    createCanvas(800, 800);
    arr = new Float32Array(arr_len * step);
    offset = 0;
    arr_filled = 0;
    noStroke();
}

function draw() {
    background(255);

    arr[offset * step] = mouseX;
    arr[offset * step + 1] = mouseY;

    offset = (offset + 1) % arr_len;
    if (arr_filled < arr_len) {
        arr_filled++;
    }

    const oldest = arr_filled === arr_len ? offset : 0;

    for (let i = 0; i < arr_filled; i++) {
        const index = (oldest + i) % arr_len;

        fill(0, 0, 0, map(i, 0, arr_len, 0, 255));
        circle(arr[index * step], arr[index * step + 1], i/2);
    }
}
