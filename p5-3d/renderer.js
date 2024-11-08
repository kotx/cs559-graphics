const { quat, vec3, mat3, mat4 } = glMatrix;

const loading = document.querySelector("#loading");
const objFile = document.querySelector('.objFile');
const fpsLabel = document.querySelector("#fps");
const polyLabel = document.querySelector("#poly");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// note: camera position CANNOT equal target!
// also, +z is backwards
const cameraTarget = vec3.fromValues(0, 0, 0);
const cameraUp = vec3.fromValues(0, 1, 0);
const cameraRadius = 10;
const cameraHeight = 2;

// TODO: parametric curve
function updateCamera(t) {
	const x = cameraRadius * Math.cos(t);
	const z = cameraRadius * Math.sin(t);
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

function getLookAt(cameraPos) {
	return mat4.lookAt([], cameraPos, cameraTarget, cameraUp);
}

function getWorldTransform(lookAt) {
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

function isFaceVisible(lookAt, normal) {
	console.log(lookAt);
	const rotation = vec3.fromValues(lookAt[2], lookAt[5], lookAt[8]);
	vec3.normalize(rotation, rotation);
	vec3.normalize(normal, normal);
	return vec3.dot(rotation, normal) > 0;
}

function drawFace(world, vertices) {
	ctx.beginPath();
	moveToTx(vertices[0], world);
	for (const v of vertices.slice(1)) {
		lineToTx(v, world);
	}
	ctx.closePath();

	ctx.fill();
	ctx.stroke();
}

let objs;
function loadOBJs() {
	objs = [];
	try {
		for (const objText of objFile.value.split('--\n')) {
			const obj = parseOBJ(objText);
			objs.push(obj);
		}
		console.log(objs);
	} catch (e) {
		alert(e);
	}
}

loadOBJs();
let lastTime = 0;
let time = 0;
const deltaTimes = [];
function render(currentTime) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const deltaTime = currentTime - lastTime;
	deltaTimes.push(deltaTime);
	if (deltaTimes.length > 10)
		deltaTimes.splice(0,deltaTimes.length - 10);

	lastTime = currentTime;
	time += deltaTime;

	const cameraPos = updateCamera(time * 0.001);
	const lookAt = getLookAt(cameraPos);
	const world = getWorldTransform(lookAt);
	let polys = 0;

	for (const obj of objs) {
		ctx.strokeStyle = "blue";
		ctx.fillStyle = "#dddddd";

		// Hierarchical transformation
		const rotation = quat.fromEuler([], ...obj.rotation);
		const translation = vec3.fromValues(...obj.translation);
		const scale = vec3.fromValues(...obj.scale);
		const model = mat4.fromRotationTranslationScale([], rotation, translation, scale);
		mat4.mul(model, world, model);

		for (let idx = 0; idx < obj.facePositions.length; idx++) {
			const face = obj.facePositions[idx];
			const normal = obj.faceNormals[idx];

			// if (isFaceVisible(lookAt, normal)) {
				drawFace(model, face.map(vidx => obj.vertexPositions[vidx]));
				polys++;
			// }
		}
	}
	
	polyLabel.innerHTML = `Polygons: ${polys}`;
	
	const avgDelta = (deltaTimes.reduce((p, c) => p + c) / deltaTimes.length);
	fpsLabel.innerHTML = `FPS: ${Math.round(1000 / avgDelta)}`;
	requestAnimationFrame(render);
}

requestAnimationFrame(render);
loading.remove();
