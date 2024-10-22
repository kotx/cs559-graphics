const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function drawPoint({ x, y }, color = "black", radius = 10) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fill();
}

function drawBezier(p0, p1, p2, p3, color = "blue") {
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(p0.x, p0.y);
	ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
	ctx.stroke();
}

function calcBezierPos(p0, p1, p2, p3, t) {
	const t_ = 1 - t;

	return {
		x:
			t_ * t_ * t_ * p0.x +
			3 * t_ * t_ * t * p1.x +
			3 * t_ * t * t * p2.x +
			t * t * t * p3.x,

		y:
			t_ * t_ * t_ * p0.y +
			3 * t_ * t_ * t * p1.y +
			3 * t_ * t * t * p2.y +
			t * t * t * p3.y,
	};
}

class Missile {
	t = 0;
	startTime = performance.now();
	// duration = 3000 + Math.random() * 2000; // 3-5 seconds
	duration = 3000;

	segments = [];
	currentSegment = 0;

	trail = [];
	trailLength = 200;
	trailSegments = []; // tracks which segment a trail belongs to
	segmentColors = ["red", "green", "blue", "magenta", "brown", "black"];

	constructor(start, target) {
		const segmentCount = 3;
		let prev = start;

		// piecewise: our missile's path is composed of 3 bezier curves
		for (let i = 0; i < segmentCount; i++) {
			const segment = {
				p0: prev,
				p1: {
					x: prev.x + (Math.random() - 0.5) * 400,
					y: prev.y + (Math.random() - 0.5) * 400,
				},
				p2: {
					x: target.x + (Math.random() - 0.5) * 400,
					y: target.y + (Math.random() - 0.5) * 400,
				},
				p3:
					i !== segmentCount - 1
						? {
								x:
									prev.x +
									(target.x - prev.x) * ((i + 1) / segmentCount) +
									(Math.random() - 0.5) * 200,
								y:
									prev.y +
									(target.y - prev.y) * ((i + 1) / segmentCount) +
									(Math.random() - 0.5) * 200,
							}
						: target,
			};

			this.segments.push(segment);
			prev = segment.p3; // next segment starts from endpoint (c0 continuity)
		}
	}

	update(curTime) {
		const elapsed = curTime - this.startTime;
		this.t = Math.min(elapsed / this.duration, 1);

		const currentSegment = Math.min(
			Math.floor(this.t * this.segments.length),
			this.segments.length - 1,
		);
		this.currentSegment = currentSegment;

		// "local" t within the current segment
		const segmentT = this.t !== 1 ? (this.t * this.segments.length) % 1 : 1;

		const segment = this.segments[this.currentSegment];
		this.pos = calcBezierPos(
			segment.p0,
			segment.p1,
			segment.p2,
			segment.p3,
			segmentT,
		);

		// update trail
		if (!this.dead) {
			this.trail.push({ ...this.pos });
			this.trailSegments.push(currentSegment);

			if (this.trail.length > this.trailLength) {
				this.trail.shift();
				this.trailSegments.shift();
			}
		} else {
			this.trail.shift();
			this.trailSegments.shift();
		}

		if (this.t >= 1) this.dead = true;
	}

	draw() {
		const color = this.dead ? "lightgray" : "orange";

		// Draw trail
		if (this.trail.length >= 1) {
			// Start a single path for the entire trail
			ctx.beginPath();
			ctx.moveTo(this.trail[0].x, this.trail[0].y);

			// Draw lines to each point
			for (let i = 1; i < this.trail.length; i++) {
				ctx.lineTo(this.trail[i].x, this.trail[i].y);

				// If we're changing segments, finish the current stroke and start a new one
				if (
					i < this.trail.length - 1 &&
					this.trailSegments[i] !== this.trailSegments[i + 1]
				) {
					if (drawSegments)
						ctx.strokeStyle = this.segmentColors[this.trailSegments[i]];
					else ctx.strokeStyle = color;

					ctx.lineWidth = 5;
					ctx.stroke();

					// Start new path from current position
					ctx.beginPath();
					ctx.moveTo(this.trail[i].x, this.trail[i].y);
				}
			}

			// Draw the final segment
			if (drawSegments)
				ctx.strokeStyle =
					this.segmentColors[this.trailSegments[this.trail.length - 1]];
			else ctx.strokeStyle = color;

			ctx.lineWidth = 5;
			ctx.stroke();
		}

		// Draw missile (if not trail expired)
		if (this.dead && this.trailSegments.length === 0) return;
		drawPoint(this.pos, color, 10);
	}
}

// biome-ignore lint/style/useConst: changed by checkbox
let drawSegments = document.querySelector("#segments").checked;
let missiles = [];
function init() {
	startTime = performance.now();
	duration = 2000;
	missiles = [];
	fire();
}

const start = { x: 50, y: 50 };
const end = { x: 1200, y: 300 };
function fire() {
	missiles.push(new Missile(start, end));
}

function update() {
	const curTime = performance.now();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawPoint(start);
	drawPoint(end);

	for (const missile of missiles) {
		missile.update(curTime);

		// todo: explosion when dead!
		missile.draw();
	}

	requestAnimationFrame(update);
}

init();
update();
