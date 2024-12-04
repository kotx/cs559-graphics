const { mat4, vec3 } = glMatrix;

const cameraRadius = 10;
const cameraHeight = 4;
function updateCamera(t) {
	const x = cameraRadius * Math.cos(t);
	const y = cameraHeight * Math.sin(t);
	const z = cameraRadius * Math.sin(t);
	return vec3.fromValues(x, y, z);
}

class WebGLRenderer {
	constructor(canvasSelector) {
		this.canvas = document.querySelector(canvasSelector);
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.gl = this.canvas.getContext("webgl");
		if (!this.gl) throw new Error("WebGL is not supported");

		this.objects = [];
	}

	compileShader(type, source) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

	createShaderProgram(vertexShaderSource, fragmentShaderSource) {
		const gl = this.gl;
		const vertexShader = this.compileShader(
			gl.VERTEX_SHADER,
			vertexShaderSource,
		);

		const fragmentShader = this.compileShader(
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

	addObject(obj, shaderProgram) {
		const gl = this.gl;
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(obj.vertexPositions.flat()),
			gl.STATIC_DRAW,
		);

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(obj.facePositions.flat()),
			gl.STATIC_DRAW,
		);

		this.objects.push({
			vertexBuffer,
			indexBuffer,
            vertexCount: obj.facePositions.flat().length,
			shaderProgram,
		});
	}

	render(cameraPos, time) {
		const gl = this.gl;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		const lookAt = this.getLookAt(cameraPos);
		const projection = this.getProjection();

		for (const obj of this.objects) {
			gl.useProgram(obj.shaderProgram);

			// Bind vertex buffer
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);

			// Setup attributes
			const vPosition = gl.getAttribLocation(obj.shaderProgram, "vPosition");
			gl.enableVertexAttribArray(vPosition);
			gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

			// Setup uniforms
			const tMVP = mat4.create();
			mat4.multiply(tMVP, projection, lookAt);
			const mvpLocation = gl.getUniformLocation(obj.shaderProgram, "uMVP");
			this.setUniform(gl, mvpLocation, tMVP);

			const timeLocation = gl.getUniformLocation(obj.shaderProgram, "uTime");
			this.setUniform(gl, timeLocation, time);

			// Draw
			gl.drawElements(
				gl.TRIANGLES,
				obj.vertexCount,
				gl.UNSIGNED_SHORT,
				0,
			);
		}
	}

	setUniform(gl, location, value) {
		if (typeof value === "number") gl.uniform1f(location, value);
		else if (value instanceof Float32Array)
			gl.uniformMatrix4fv(location, false, value);
	}

	getLookAt(cameraPos) {
		const cameraTarget = vec3.fromValues(0, 0, 0);
		const cameraUp = vec3.fromValues(0, 1, 0);
		return mat4.lookAt([], cameraPos, cameraTarget, cameraUp);
	}

	getProjection() {
		return mat4.perspective(
			[],
			Math.PI / 4,
			this.canvas.width / this.canvas.height,
			0.1,
			100.0,
		);
	}
}

const renderer = new WebGLRenderer("canvas");

// Create shader program
const vertexShader = document.getElementById("vert").text;
const fragmentShader = document.getElementById("frag").text;
const shaderProgram = renderer.createShaderProgram(
	vertexShader,
	fragmentShader,
);

const obj1 = parseOBJ(document.getElementById("obj1").text);
const obj2 = parseOBJ(document.getElementById("obj2").text);

renderer.addObject(obj1, shaderProgram);
renderer.addObject(obj2, shaderProgram);

// Animation loop
let lastTime = 0;
function draw(currentTime) {
	const deltaTime = currentTime - lastTime;
	lastTime = currentTime;

	const cameraPos = updateCamera(lastTime * 0.001);
	renderer.render(cameraPos, deltaTime);

	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
document.querySelector("#loading").remove();
