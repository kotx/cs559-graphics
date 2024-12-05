const { mat4, vec3 } = glMatrix;

const cameraRadius = 20;
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
            alert(
                `${type === gl.VERTEX_SHADER ? "vertex" : type === gl.FRAGMENT_SHADER ? "fragment" : "[unknown type]"}: ${gl.getShaderInfoLog(shader)}`,
            );
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

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(
                obj.faceNormals.flat().flatMap((i) => obj.vertexNormals[i]),
            ),
            gl.STATIC_DRAW,
        );

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(obj.vertexColors.flat()),
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
            normalBuffer,
            colorBuffer,
            indexBuffer,
            vertexCount: obj.facePositions.flat().length,
            shaderProgram,
        });
    }

    render(cameraPos, time) {
        const gl = this.gl;
        gl.clearColor(0.5, 0.0, 0.5, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        const lookAt = this.getLookAt(cameraPos);
        const projection = this.getProjection();

        for (const obj of this.objects) {
            gl.useProgram(obj.shaderProgram);

            if (!obj.vertexBuffer || !obj.normalBuffer || !obj.colorBuffer) {
                alert("One or more buffers are not initialized");
                return;
            }

            // Bind vertex buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBuffer);

            // Setup attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
            const vPosition = gl.getAttribLocation(obj.shaderProgram, "vPosition");
            gl.enableVertexAttribArray(vPosition);
            gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
            const vNormal = gl.getAttribLocation(obj.shaderProgram, "vNormal");
            gl.enableVertexAttribArray(vNormal);
            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
            const vColor = gl.getAttribLocation(obj.shaderProgram, "vColor");
            gl.enableVertexAttribArray(vColor);
            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

            // Setup uniforms
            const tMVP = mat4.create();
            mat4.multiply(tMVP, projection, lookAt);
            const mvpLocation = gl.getUniformLocation(obj.shaderProgram, "mvpMatrix");
            this.setUniform(gl, mvpLocation, tMVP);

            const timeLocation = gl.getUniformLocation(obj.shaderProgram, "time");
            this.setUniform(gl, timeLocation, time);

            // Draw
            gl.drawElements(gl.TRIANGLES, obj.vertexCount, gl.UNSIGNED_SHORT, 0);
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

const monkeOBJ = parseOBJ(document.getElementById("monke").text);

// Create a grid of monkeys
const gridSize = 10;
const spacing = 2.0;
const monkeys = [];

for (let x = -gridSize; x < gridSize; x++) {
    for (let y = -gridSize; y < gridSize; y++) {
        const rand = (Math.random() - 0.5) * gridSize * 2;

        const monkey = structuredClone(monkeOBJ);
        for (let i = 0; i < monkey.vertexPositions.length; i++) {
            monkey.vertexPositions[i] = [
                monkey.vertexPositions[i][0] + x * spacing,
                monkey.vertexPositions[i][1] + y * spacing,
                monkey.vertexPositions[i][2] + rand
            ];
        }
        monkeys.push(monkey);
        renderer.addObject(monkey, shaderProgram);
    }
}

function draw(currentTimeMs) {
    const currentTime = currentTimeMs / 1000;
    const cameraPos = updateCamera(currentTime);
    renderer.render(cameraPos, currentTime);

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
document.querySelector("#loading").remove();
