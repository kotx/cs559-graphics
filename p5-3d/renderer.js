const { mat4, vec3 } = glMatrix;

const loading = document.querySelector("#loading");
const objFile = document.querySelector('.objFile');
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// note: camera position CANNOT equal target!
// also, +z is backwards
const cameraTarget = vec3.fromValues(0, 0, 0);
const cameraUp = vec3.fromValues(0, 1, 0);
const cameraRadius = 10;
const cameraHeight = 2;
let time = 0;

// TODO: parametric curve
function updateCamera(t) {
	const x = cameraRadius * Math.cos(t * 0.6);
	const z = cameraRadius * Math.sin(t * 0.6);
	return vec3.fromValues(x, cameraHeight, z);
}

// From lecture slides
function moveToTx(loc, Tx) {
	const res = vec3.transformMat4([], loc, Tx);
	ctx.moveTo(res[0], res[1]);
}

// From lecture slides
function lineToTx(loc, Tx) {
	const res = vec3.transformMat4([], loc, Tx);
	ctx.lineTo(res[0], res[1]);
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

let objs;
function loadOBJs() {
	objs = [];

	try {
		for (const objText of objFile.value.split('--\n')) {
			objs.push(parseOBJ(objText));
		}
	} catch (e) {
		alert(e);
	}
}

loadOBJs();
let lastTime = 0;
function render(currentTime) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const deltaTime = currentTime - lastTime;
	lastTime = currentTime;

	time += 0.001 * deltaTime; // Camera movement speed

	const world = getWorldTransform();
	for (const obj of objs) {
		for (const face of obj.facePositions) {
			ctx.strokeStyle = "blue";
			drawFace(world, face.map(idx => obj.vertexPositions[idx]));
		}
	}

	requestAnimationFrame(render);
}

requestAnimationFrame(render);
loading.remove();
