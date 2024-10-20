class Player {
	sprite = new AnimatedSprite(
		"MyChar.png",
		// sprite size
		[16, 16],
		// position
		[100, 100],
		// fps
		15,
		// animations
		new Map([
			["idleleft", [[0, 0], null]],
			["idleright", [[1, 0], null]],
			["idleleftup", [[0, 3], null]],
			["idlerightup", [[1, 3], null]],
			["idleleftdown", [[0, 7], null]],
			["idlerightdown", [[1, 7], null]],
			["walkleftdown", [[0, 6], null]],
			["walkrightdown", [[1, 6], null]],
			[
				"walkleft",
				[
					[0, 0],
					[0, 1],
					[0, 2],
				],
			],
			[
				"walkleftup",
				[
					[0, 3],
					[0, 4],
					[0, 5],
				],
			],
			[
				"walkright",
				[
					[1, 0],
					[1, 1],
					[1, 2],
				],
			],
			[
				"walkrightup",
				[
					[1, 3],
					[1, 4],
					[1, 5],
				],
			],
		]),
	);

	pos = [0, 0];
	state = "idle";
	dir = "left";
	look = "";

	async load() {
		await this.sprite.load();
	}

	update(elapsedTime) {
		if (Input.keyDown("ArrowLeft")) {
			this.dir = "left";
			this.state = "walk";
		} else if (Input.keyDown("ArrowRight")) {
			this.dir = "right";
			this.state = "walk";
		} else {
			this.state = "idle";
		}

		if (Input.keyDown("ArrowDown")) {
			this.look = "down";
		} else if (Input.keyDown("ArrowUp")) {
			this.look = "up";
		} else {
			this.look = "";
		}
	}

	draw(elapsedTime) {
		let animState;
		switch (this.state) {
			case "idle":
			case "walk":
				animState = this.state + this.dir + (this.look || "");
		}

		this.sprite.draw(this.pos, elapsedTime, animState);
	}
}

const Quote = new Player();
