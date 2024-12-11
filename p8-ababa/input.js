let fileContents = {};

const fileInput = document.getElementById("srcfiles");
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
						const object = new OBJFile(event.target.result).parse();
						for (const model of object.models) {
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
							object,
						});
						console.log(`Loaded ${file.name} as object`);
					} else if (file.name.endsWith(".mtl")) {
						resolve({
							filename: file.name,
							material: new MTLFile(event.target.result).parse(),
						});
						console.log(`Loaded ${file.name} as material`);
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
