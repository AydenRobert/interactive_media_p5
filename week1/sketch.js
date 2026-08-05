function setup() {
    createCanvas(displayWidth, displayHeight);
}

function draw_eye(head, is_left) {
    const eye_offset_x = 20;
    const eye_offset_y = 20;
    const eye_radius = 20;

    if (is_left) {
        circle(head.x - eye_offset_x, head.y - eye_offset_y, eye_radius);
    } else {
        circle(head.x + eye_offset_x, head.y - eye_offset_y, eye_radius);
    }
}

function draw_head() {
    let head = {
        x: mouseX,
        y: mouseY,
        r: 50
    };

    circle(head.x, head.y, head.r);

    draw_eye(head, true);
    draw_eye(head, false);
}

function draw_alien() {
    draw_head();
}

function draw() {
    background(30);

    fill(255);
    draw_alien();
}
