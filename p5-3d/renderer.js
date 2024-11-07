const { mat4, vec3 } = glMatrix;

// Set up the canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const loading = document.querySelector("#loading");

// note: camera position CANNOT equal target!
// also, +z is backwards
const cameraTarget = vec3.fromValues(0, 4, 0);
const cameraUp = vec3.fromValues(0, 1, 0);
let time = 0;

function moveToTx(loc, Tx) {
	const res = vec3.transformMat4([], loc, Tx);
	ctx.moveTo(res[0], res[1]);
}

function lineToTx(loc, Tx) {
	const res = vec3.transformMat4([], loc, Tx);
	ctx.lineTo(res[0], res[1]);
}

// TODO: parametric curve
function updateCamera(t) {
	const radius = 12;
	const height = 10;
	const x = radius * Math.cos(t);
	const z = radius * Math.sin(t);
	return vec3.fromValues(x, height, z);
}

function getWorldTransform() {
	const cameraPos = updateCamera(time);
	const lookAt = mat4.lookAt([], cameraPos, cameraTarget, cameraUp);
	const projection = mat4.perspective(
		[],
		Math.PI / 4,
		canvas.width / canvas.height,
		0.1, // near plane
		100.0, // far plane
	);

	const viewport = mat4.create();
	// the center of the viewport is our lookat target
	mat4.fromTranslation(viewport, [canvas.width / 2, canvas.height / 2, 0]);
	mat4.scale(viewport, viewport, [canvas.width / 2, -canvas.height / 2, 1]);

	const world = mat4.create();
	mat4.mul(world, viewport, projection);
	mat4.mul(world, world, lookAt);

	return world;
}

function drawFace(world, vertices) {
	ctx.beginPath();
	moveToTx(vertices[0], world);
	for (const v of vertices.slice(1)) {
		lineToTx(v, world);
	}
	ctx.closePath();
	ctx.stroke();
}

function drawBase(transform) {
	const baseHeight = 6;
	const baseWidth = 2;

	const vertices = [
		[-baseWidth, 0, -baseWidth],
		[baseWidth, 0, -baseWidth],
		[baseWidth, baseHeight, -baseWidth],
		[-baseWidth, baseHeight, -baseWidth],
		[-baseWidth, 0, baseWidth],
		[baseWidth, 0, baseWidth],
		[baseWidth, baseHeight, baseWidth],
		[-baseWidth, baseHeight, baseWidth],
	];

	// Draw front face
	drawFace(
		transform,
		[vertices[0], vertices[1], vertices[2], vertices[3]]
	);

	// Draw back face
	drawFace(
		transform,
		[vertices[4], vertices[5], vertices[6], vertices[7]]
	);
}

// Animation loop
let lastTime = 0;
let rotation = 0;

function animate(currentTime) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const deltaTime = currentTime - lastTime;
	lastTime = currentTime;

	time += 0.001 * deltaTime; // Camera movement speed
	rotation += 0.002 * deltaTime; // Blade rotation speed

	const world = getWorldTransform();
	drawBase(world);

	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
loading.remove();
