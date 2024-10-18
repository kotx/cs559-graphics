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
            ["idleleft", [[0, 0]]],
            ["idleright", [[1, 0]]],
            ["idleleftup", [[0, 3]]],
            ["idlerightup", [[1, 3]]],
            ["leftdown", [[0, 7]]],
            ["rightdown", [[1, 7]]],
            ["leftdown", [[0, 6]]],
            ["rightdown", [[1, 6]]],
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
        ])
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
                animState = (this.look === "down" ? "" : this.state) + this.dir + (this.look || "");
        }

        this.sprite.draw(elapsedTime, animState);
    }
}

const Quote = new Player();