import fs from "node:fs";
import parseWavefront from "npm:wavefront-obj-parser";
import expandVertexData from "npm:expand-vertex-data";
import { gzip } from "jsr:@deno-library/compress";

const wavefrontFile = fs.readFileSync("frog.obj").toString();
const parsedWavefront = parseWavefront(wavefrontFile);

// Pass this data into your ELEMENT_ARRAY_BUFFER and ARRAY_BUFFERS
const expanded = expandVertexData(parsedWavefront, {
	facesToTriangles: true,
});

console.log(expanded);
const payload = new TextEncoder().encode(JSON.stringify(expanded));
fs.writeFileSync("model.json.gz", gzip(payload));
