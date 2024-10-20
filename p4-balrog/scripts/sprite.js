const scalingFactor = 3;

class Sprite {
	constructor(path, tileSize) {
		this.path = path;
		this.tileSize = tileSize;
		this.frames = frames;
		this.frameIdx = 0;
	}

	load() {
		return new Promise((resolve, reject) => {
			this.image = new Image();
			this.image.src = `sprites/${this.path}`;

			this.image.addEventListener("load", resolve);
			this.image.addEventListener("error", reject);
		});
	}

	draw(pos, slicePos = [0, 0]) {
		ctx.drawImage(
			this.image,

			// slice position
			slicePos[1] * this.tileSize[0],
			slicePos[0] * this.tileSize[1],

			// slice dimensions
			this.tileSize[0],
			this.tileSize[1],

			// sprite position
			pos[0],
			pos[1],

			// sprite dimensions
			this.tileSize[0] * scalingFactor,
			this.tileSize[1] * scalingFactor,
		);
	}
}

class AnimatedSprite extends Sprite {
	currentFrame = 0;
	elapsedTime = 0;
	lastState = null;

	constructor(path, tileSize, pos, fps, animations) {
		super(path, tileSize, pos);
		this.frameTime = 1000 / fps;
		this.animations = animations;
	}

	update(elapsedTime, state) {
		if (this.lastState !== state) {
			this.elapsedTime = 0;
			this.currentFrame = 0;
			this.lastState = state;
			return;
		}

		this.elapsedTime += elapsedTime;
		if (this.elapsedTime > this.frameTime) {
			this.currentFrame++;
			this.elapsedTime = 0;

			// null is the flag for non-looping animations
			if (state[this.currentFrame] === null) {
				this.currentFrame--;
			}

			if (this.currentFrame >= state.length) {
				this.currentFrame = 0;
			}
		}
	}

	draw(pos, elapsedTime, state, forceFrame = null) {
		const anim = this.animations.get(state);
		if (forceFrame != null) {
			super.draw(pos, anim[forceFrame]);
		} else {
			this.update(elapsedTime, anim);
			super.draw(pos, anim[this.currentFrame]);
		}
	}
}
