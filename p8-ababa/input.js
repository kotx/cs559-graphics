let fileContents = {};

const fileInput = document.getElementById("srcFiles");
fileInput.addEventListener("change", async () => {
	const files = fileInput.files;

	fileContents = {};

	function readFile(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			if (file.type.startsWith("image/")) {
				reader.onload = (event) => {
					const img = document.createElement("img");
					img.src = event.target.result;
					img.onerror = () => alert(`Error loading image ${file.name}`);

					console.log(`Loaded ${file.name} as image`);
					resolve({
						filename: file.name,
						img,
					});
				};
				reader.readAsDataURL(file);
			} else {
				reader.onload = (event) => {
					if (file.name.endsWith(".obj")) {
						try {
							const obj = new OBJFile(event.target.result).parse();
							for (const model of obj.models) {
								for (const face of model.faces) {
									if (face.vertices.length !== 3) {
										alert(
											"Error: only faces with triangles are supported currently. Triangulate the mesh!",
										);
										throw "Found non-triangular faces";
									}
								}
							}
							resolve({
								filename: file.name,
								obj,
							});
							alert(`Loaded ${file.name} as obj`);
						} catch (e) {
							alert(`Error loading ${file.name}: ${e}`);
						}
					} else if (file.name.endsWith(".mtl")) {
						try {
							resolve({
								filename: file.name,
								mtl: new MTLFile(event.target.result).parse(),
							});
							alert(`Loaded ${file.name} as material`);
						} catch (e) {
							alert(`Error loading ${file.name}: ${e}`);
						}
					} else {
						alert(`Skipping unrecognized file ${file.name}`);
					}
				};
				reader.readAsText(file);
			}
			reader.onerror = reject;
		});
	}

	try {
		const fileProcessPromises = Array.from(files).map(readFile);
		const processedFiles = await Promise.all(fileProcessPromises);

		console.log(processedFiles);
		document.dispatchEvent(
			new CustomEvent("resourceload", {
				detail: processedFiles,
			}),
		);
	} catch (error) {
		console.error(error);
		alert(error.message);
	}
});
