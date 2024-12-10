export interface Resource {
	filename: string;
	mtl?: Mtl[];
	obj?: Obj;
	img?: HTMLImageElement;
}

export interface Mtl {
	name: Name;
	illum: number;
	Ka: Ka;
	Kd: Ka;
	Ks: Ka;
	map_Ka: Map;
	map_Kd: Map;
	map_Ks: Map;
	map_d: Map;
	dissolve: number;
}

export interface Ka {
	method: string;
	red: number;
	green: number;
	blue: number;
}

export interface Map {
	file: null | string;
}

export enum Name {
	InitialShadingGroup = "initialShadingGroup",
}

export interface Obj {
	models: Model[];
	materialLibraries: string[];
}

export interface Model {
	name: string;
	vertices: VertexNormalElement[];
	textureCoords: TextureCoord[];
	vertexNormals: VertexNormalElement[];
	faces: Face[];
	lines: any[];
}

export interface Face {
	material: Name;
	group: string;
	smoothingGroup: number;
	vertices: FaceVertex[];
}

export interface FaceVertex {
	vertexIndex: number;
	textureCoordsIndex: number;
	vertexNormalIndex: number;
}

export interface TextureCoord {
	u: number;
	v: number;
	w: number;
}

export interface VertexNormalElement {
	x: number;
	y: number;
	z: number;
}
