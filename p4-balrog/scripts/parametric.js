class Parametric {
    phase = 0;

	draw(t) {
		function drawPoint(x, y, color, radius = 4) {
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();
		}

		function drawText(text, x, y) {
			ctx.font = "12px Arial";
			ctx.fillStyle = "white";
			ctx.fillText(text, x, y);
		}

		function drawWaveBezier(points, showControlPoints = true) {
			if (points.length < 4 || points.length % 3 !== 1) {
				console.error(
					"Number of points must be 3n+1, where n is the number of curves",
				);
				return;
			}

			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);

			for (let i = 1; i < points.length; i += 3) {
				ctx.bezierCurveTo(
					points[i].x,
					points[i].y,
					points[i + 1].x,
					points[i + 1].y,
					points[i + 2].x,
					points[i + 2].y,
				);
			}

			ctx.strokeStyle = "blue";
			ctx.lineWidth = 3;
			ctx.stroke();

			if (showControlPoints) {
				// Draw points
				points.forEach((point, index) => {
					const color = index % 3 === 0 ? "red" : "green";
					const radius = index % 3 === 0 ? 4 : 3;
					drawPoint(point.x, point.y, color, radius);
				});

				// Add labels
				drawText("Start", points[0].x - 10, points[0].y + 20);
				drawText(
					"End",
					points[points.length - 1].x - 10,
					points[points.length - 1].y + 20,
				);
			}
		}

		function generateWavePoints(numWaves, width, height, amplitude) {
			const points = [];
			const segmentWidth = width / numWaves;

			for (let i = 0; i <= numWaves; i++) {
				const x = i * segmentWidth;
				const y = height / 2 + Math.sin(i * Math.PI) * amplitude;

				if (i > 0) {
					// Control points
					points.push({
						x: x - segmentWidth * 0.5,
						y: height / 2 + Math.sin((i - 0.5) * Math.PI) * amplitude * 1.5,
					});
					points.push({
						x: x - segmentWidth * 0.5,
						y: height / 2 + Math.sin((i - 0.5) * Math.PI) * amplitude * 1.5,
					});
				}

				// Anchor point
				points.push({ x, y });
			}

			return points;
		}

		function calculateBezierPoint(t, p0, p1, p2, p3) {
			const cX = 3 * (p1.x - p0.x);
			const bX = 3 * (p2.x - p1.x) - cX;
			const aX = p3.x - p0.x - cX - bX;

			const cY = 3 * (p1.y - p0.y);
			const bY = 3 * (p2.y - p1.y) - cY;
			const aY = p3.y - p0.y - cY - bY;

			const x = aX * t ** 3 + bX * t ** 2 + cX * t + p0.x;
			const y = aY * t ** 3 + bY * t ** 2 + cY * t + p0.y;

			return { x, y };
		}

		const points = generateWavePoints(
			9,
			canvas.width * 0.6,
			canvas.height * 0.5,
			30,
		);

		ctx.translate(canvas.width * 0.2, 0);
		drawWaveBezier(points, true);

		const p = t / 1000;

        
		const pos = calculateBezierPoint(p % 1, ...points.slice(m, m + 4));
		drawPoint(pos.x, pos.y, "blue", 8);

		ctx.resetTransform();
        return pos;
	}
}
