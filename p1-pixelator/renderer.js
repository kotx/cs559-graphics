let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let pxidx = document.querySelector("#pxsize");
let pxsizeLabel = document.querySelector("#pxsizeLabel");
let pxsizes = [1, 2, 4, 8, 16, 32, 64, 128, 256];
let pxsize = pxsizes[pxidx.value];
pxidx.max = pxsizes.length - 1;
pxsizeLabel.textContent = `${pxsize} (${canvas.width / pxsize}x${canvas.height / pxsize})`;
pxidx.addEventListener("input", (ev) => {
    pxsize = pxsizes[ev.target.value];
    pxsizeLabel.textContent = `${pxsize} (${canvas.width / pxsize}x${canvas.height / pxsize})`;
    requestAnimationFrame(draw);
});

let shapeSet = document.querySelector("#shapeSet");
shapeSet.addEventListener("click", (ev) => {
    requestAnimationFrame(draw);
});

let pxSampling = document.querySelector("#sampleSet");
pxSampling.addEventListener("change", (ev) => {
    requestAnimationFrame(draw);
});

let fileInput = document.querySelector("#fileInput");
let bmp; // todo: default value
fileInput.addEventListener("change", async (ev) => {
    let file = ev.target.files[0];
    bmp = await createImageBitmap(file);
    requestAnimationFrame(draw);
});

function drawEmpty() {
    ctx.fillStyle = "rgba(255, 0, 255, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);

    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "28px monospace";
    ctx.fillText("No image", canvas.width / 2, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bmp)
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    else
        drawEmpty();


    let image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let data = new FormData(document.querySelector("form"));
    for (let y = 0; y < canvas.height; y += pxsize) {
        for (let x = 0; x < canvas.width; x += pxsize) {
            let [r, g, b, a] = [0, 0, 0, 0];
            // optimization: it would be better to separate the sampling and rendering passes
            switch (data.get("sample")) {
                case "topLeft":
                    let idx = (y * canvas.width + x) * 4;
                    [r, g, b, a] = image.data.slice(idx, idx + 4);
                    break;
                case "bilinear":
                    for (let iy = y; iy < y + pxsize; iy++) {
                        for (let ix = x; ix < x + pxsize; ix++) {
                            let idx = (iy * canvas.width + ix) * 4;
                            r += image.data[idx];
                            g += image.data[idx + 1];
                            b += image.data[idx + 2];
                            a += image.data[idx + 3];
                        }
                    }
                    r /= pxsize * pxsize;
                    g /= pxsize * pxsize;
                    b /= pxsize * pxsize;
                    a /= pxsize * pxsize;
                    break;
            }

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

            let shape = data.get("shape");
            if (shape === "random")
                shape = ["square", "triangle", "circle"][Math.floor(Math.random() * 3)];
            switch (shape) {
                case "square":
                    ctx.fillRect(x, y, pxsize, pxsize);
                    break;
                case "triangle":
                    ctx.beginPath();
                    ctx.moveTo(x + pxsize / 2, y);
                    ctx.lineTo(x, y + pxsize);
                    ctx.lineTo(x + pxsize, y + pxsize);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case "circle":
                    ctx.beginPath();
                    ctx.arc(x + pxsize / 2, y + pxsize / 2, pxsize / 2, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        }
    }
}

requestAnimationFrame(draw);
