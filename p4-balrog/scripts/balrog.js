class Boss {
	sprite = new AnimatedSprite(
		"NpcBllg.png",
		// sprite size
		[40, 24],
		// position
		[150, 100],
		// fps
		30,
		// animations
		new Map([
			["idleleft", [[0, 0]]],
			["idleright", [[1, 0]]],
			[
				"walkleft", // 15fps
				[
					[0, 0],
					[0, 0],
					[2, 1],
					[2, 1],
					[0, 0],
					[0, 0],
					[2, 0],
					[2, 0],
				],
			],
			[
				"walkright", // 15fps
				[
					[1, 0],
					[1, 0],
					[3, 1],
					[3, 1],
					[1, 0],
					[1, 0],
					[3, 0],
					[3, 0],
				],
			],
			["jumpleft", [[0, 3], null]],
			["jumpright", [[1, 3], null]],
			["landleft", [[0, 2], null]],
			["landright", [[1, 2], null]],
			["crashleft", [[0, 1], null]],
			["crashright", [[1, 1], null]],
			[
				"flyleft",
				[
					[2, 4],
					[2, 5],
				],
			],
			[
				"flyright",
				[
					[3, 4],
					[3, 5],
				],
			],
		]),
	);

	pos = [0, 0];
	state = "fly";
	dir = "left";
    time = 0;

	async load() {
		await this.sprite.load();
	}

	update(elapsedTime) {
        time += elapsedTime;
        
    }

	draw(elapsedTime) {
		const animState = this.state + this.dir;
		this.sprite.draw(this.pos, elapsedTime, animState);
	}
}

const Balrog = new Boss();
