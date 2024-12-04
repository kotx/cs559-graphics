// Heavily adapted from https://github.com/mikolalysenko/parse-obj/blob/master/parse-obj.js
// under the MIT license.
// Changes made:
// - Use a string instead of stream
// - Use sync instead of promises
// - Custom directives
function parseOBJ(text) {
	const v = [];
	const vn = [];
	const vt = [];
	const f = [];
	const fn = [];
	const ft = [];

	text.split("\n").map((line) => {
		line = line.trim();
		if (line.length === 0 || line.charAt(0) === "#") {
			return;
		}

		const toks = line.split(" ");
		switch (toks[0]) {
			case "v":
				if (toks.length < 3) {
					throw new Error(`parse-obj: Invalid vertex :${line}`);
				}
				v.push([+toks[1], +toks[2], +toks[3]]);
				break;

			case "vn":
				if (toks.length < 3) {
					throw new Error(`parse-obj: Invalid vertex normal:${line}`);
				}
				vn.push([+toks[1], +toks[2], +toks[3]]);
				break;

			case "vt":
				if (toks.length < 2) {
					throw new Error(`parse-obj: Invalid vertex texture coord:${line}`);
				}
				vt.push([+toks[1], +toks[2]]);
				break;

			case "f": {
				const position = new Array(toks.length - 1);
				const normal = new Array(toks.length - 1);
				const texCoord = new Array(toks.length - 1);
				for (let i = 1; i < toks.length; ++i) {
					const indices = toks[i].split("/");
					position[i - 1] = (indices[0] | 0) - 1;
					texCoord[i - 1] = indices[1] ? (indices[1] | 0) - 1 : -1;
					normal[i - 1] = indices[2] ? (indices[2] | 0) - 1 : -1;
				}
				f.push(position);
				fn.push(normal);
				ft.push(texCoord);
				break;
			}

			case "vp":
			case "s":
			case "o":
			case "g":
			case "usemtl":
			case "mtllib":
				//Ignore this crap
				break;

			default:
				throw new Error(`parse-obj: Unrecognized directive: '${toks[0]}'`);
		}
	});

	return {
		vertexPositions: v,
		vertexNormals: vn,
		vertexUVs: vt,
		facePositions: f,
		faceNormals: fn,
		faceUVs: ft,
	};
}
