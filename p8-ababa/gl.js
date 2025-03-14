const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

function degToRad(d) {
	return (d * Math.PI) / 180;
}

function isPowerOf2(value) {
	return (value & (value - 1)) === 0;
}

function makeBuffer(target, data) {
	const buf = gl.createBuffer();
	gl.bindBuffer(target, buf);
	gl.bufferData(target, data, gl.STATIC_DRAW);
	return buf;
}

function compileShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw `could not compile shader: ${gl.getShaderInfoLog(shader)}`;
	}

	return shader;
}

function linkProgram(vertex, fragment) {
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw `could not link program: ${gl.getProgramInfoLog(program)}`;
	}

	return program;
}

function makeTexture() {
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([255, 0, 255, 255]),
	);
	return tex;
}

function initTexture(tex, image) {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		console.log(`Generating mipmaps for ${image.src}`);
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	return tex;
}

function setAttr(
	program,
	attrName,
	buf,
	type = gl.FLOAT,
	normalize = false,
	numComponents = 3,
	offset = 0,
	stride = 0,
) {
	const attrId = gl.getAttribLocation(program, attrName);
	gl.enableVertexAttribArray(attrId);
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.vertexAttribPointer(
		attrId,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
}

function setUniform(program, uniformName, func) {
	const uniformLoc = gl.getUniformLocation(program, uniformName);
	func(uniformLoc);
}

function setTexture(tex, unit, program, samplerName) {
	gl.activeTexture(gl.TEXTURE0 + unit);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	setUniform(program, samplerName, (loc) => gl.uniform1i(loc, 0));
}

function loadTexture(url) {
	return new Promise((resolve) => {
		const tex = makeTexture();
		const image = new Image();
		image.addEventListener("load", () => {
			initTexture(tex, image);
			resolve(tex);
		});
		image.addEventListener("error", () => {
			alert(`Error loading texture image ${url}. Falling back to default textures`);
			image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII=";
			// todo: check if this refires the load event
		});
		image.crossOrigin = "anonymous";
		image.src = url;
	});
}
