const { mat4, vec3 } = glMatrix;

// Camera setup
const cameraRadius = 20;
const cameraHeight = 4;
function updateCamera(t) {
	const x = cameraRadius * Math.cos(t / 4);
	const y = cameraHeight * Math.sin(t / 4);
	const z = cameraRadius * Math.sin(t / 4);
	return vec3.fromValues(x, y, z);
}

// Canvas and WebGL setup
const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext("webgl");
if (!gl) throw new Error("WebGL is not supported");

// Shader compilation
function compileShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(
			`${type === gl.VERTEX_SHADER ? "vertex" : type === gl.FRAGMENT_SHADER ? "fragment" : "[unknown type]"}: ${gl.getShaderInfoLog(shader)}`,
		);
		return null;
	}
	return shader;
}

// Create shader program
function createShaderProgram(vertexShaderSource, fragmentShaderSource) {
	const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = compileShader(
		gl.FRAGMENT_SHADER,
		fragmentShaderSource,
	);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Could not initialize shaders");
	}
	return program;
}

const vertexShader = document.getElementById("vert").text;
const fragmentShader = document.getElementById("frag").text;
const shaderProgram = createShaderProgram(vertexShader, fragmentShader);

document.addEventListener("resourceload", (ev) => {
	const resources = ev.detail;
	for (const res of resources) {
		if (res.obj) {
			for (const model of res.obj.models) {
				// Create WebGL buffers
				const vertexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
				gl.bufferData(
					gl.ARRAY_BUFFER,
					new Float32Array(model.vertices.flatMap(({ x, y, z }) => [x, y, z])),
					gl.STATIC_DRAW,
				);

				const normalBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
				gl.bufferData(
					gl.ARRAY_BUFFER,
					new Float32Array(
						model.vertexNormals.flatMap(({ x, y, z }) => [x, y, z]),
					),
					gl.STATIC_DRAW,
				);

				const indexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
				gl.bufferData(
					gl.ELEMENT_ARRAY_BUFFER,
					new Uint16Array(model.faces.flatMap((tri) => {
						
					})),
					gl.STATIC_DRAW,
				);
			}
		}
	}
});

// Rendering function

function render(cameraPos, time) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);

	// Create view and projection matrices
	const lookAt = mat4.create();
	const cameraTarget = vec3.fromValues(0, 0, 0);
	const cameraUp = vec3.fromValues(0, 1, 0);
	mat4.lookAt(lookAt, cameraPos, cameraTarget, cameraUp);

	const projection = mat4.create();
	mat4.perspective(
		projection,
		Math.PI / 4,
		canvas.width / canvas.height,
		0.1,
		100.0,
	);

	// // Use shader program
	// gl.useProgram(shaderProgram);

	// // Bind and setup vertex buffer
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// const vPosition = gl.getAttribLocation(shaderProgram, "vPosition");
	// gl.enableVertexAttribArray(vPosition);
	// gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

	// // Bind and setup normal buffer
	// gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	// const vNormal = gl.getAttribLocation(shaderProgram, "vNormal");
	// gl.enableVertexAttribArray(vNormal);
	// gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

	// // Bind and setup color buffer
	// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	// const vColor = gl.getAttribLocation(shaderProgram, "vColor");
	// gl.enableVertexAttribArray(vColor);
	// gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

	// // Setup MVP matrix
	// const tMVP = mat4.create();
	// mat4.multiply(tMVP, projection, lookAt);
	// const mvpLocation = gl.getUniformLocation(shaderProgram, "mvpMatrix");
	// gl.uniformMatrix4fv(mvpLocation, false, tMVP);

	// // Pass time uniform
	// const timeLocation = gl.getUniformLocation(shaderProgram, "time");
	// gl.uniform1f(timeLocation, time);

	// // Draw
	// gl.drawElements(
	// 	gl.TRIANGLES,
	// 	monkey.facePositions.flat().length,
	// 	gl.UNSIGNED_SHORT,
	// 	0,
	// );
}

function draw(currentTimeMs) {
	const currentTime = currentTimeMs / 1000;
	const cameraPos = updateCamera(currentTime);
	render(cameraPos, currentTime);

	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
document.querySelector("#loading").remove();
