class InputManager {
    state = new Map();
    tick = 0;

    constructor() {
        document.addEventListener("keyup", ({ key }) => {
            this.state.delete(key);
        });

        document.addEventListener("keydown", ({ key }) => {
            this.state.set(key, 0);
        });

        document.addEventListener("blur", () => {
            this.state.clear();
        })
    }

    update(elapsedTime) {
        for (const key of this.state) {
            const duration = this.state.has(key);
            if (typeof duration !== "undefined")
                this.state.set(duration + elapsedTime);
        }
    }

    keyDown(key) {
        return this.state.has(key);
    }

    keyDownTime(key) {
        return this.state.get(key);
    }
}

const Input = new InputManager();