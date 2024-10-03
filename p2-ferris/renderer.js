let canvas = /** @type {HTMLCanvasElement} */ (document.querySelector("canvas"));
let ctx = canvas.getContext("2d");

let startTime = performance.now();

function draw() {
    let radius = document.getElementById("radius").value;
    let hubSize = document.getElementById("hubSize").value;
    let speed = document.getElementById("speed").value;
    let spokes = document.getElementById("spokes").value;
    let cableLength = document.getElementById("cableLength").value;
    let carSize = document.getElementById("carSize").value;

    requestAnimationFrame(draw);
    let now = performance.now() - startTime;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let angle = now / 1000 * speed;

    // center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // feet
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.moveTo(0, 0);
        ctx.lineTo(-canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.save();
        ctx.rotate(angle);

        // wheel
        ctx.lineWidth = 4;
        let wheelGradient = ctx.createLinearGradient(0, 0, radius, 0);
        wheelGradient.addColorStop("0", "white");
        wheelGradient.addColorStop("0.5", "gray");
        wheelGradient.addColorStop("1.0", "white");
        ctx.strokeStyle = wheelGradient;
        ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.stroke();

        for (let i = 0; i < 2 * Math.PI; i += 2 * Math.PI / spokes) {
            ctx.save();
                // spoke
                let [x, y] = [radius * Math.cos(angle + i), radius * Math.sin(angle + i)];
                ctx.strokeStyle = "orange";
                ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(x, y);
                ctx.stroke();

                // spoke end
                ctx.translate(x, y);
                    // reset rotation
                    ctx.rotate(-angle);

                    // cables
                    ctx.strokeStyle = "gray";
                    ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, cableLength);
                    ctx.stroke();

                    // cars
                    ctx.fillStyle = "pink";
                    ctx.fillRect(-carSize/2, cableLength, carSize, carSize);

                    // balls
                    ctx.fillStyle = "orange";
                    ctx.beginPath();
                        ctx.arc(0, 0, 10, 0, 2 * Math.PI);
                    ctx.fill();

            ctx.restore();
        }
        
        // hub
        ctx.fillStyle = "orange";
        ctx.strokeStyle = "white";
        ctx.beginPath();
            ctx.arc(0, 0, hubSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    ctx.restore();
}

requestAnimationFrame(draw);