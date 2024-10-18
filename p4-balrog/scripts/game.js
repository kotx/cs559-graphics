const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

(async () => {
  await Quote.load();

  let time = performance.now();
  function tick() {
    const now = performance.now();
    const elapsed = now - time;
    
    Quote.update(elapsed);
    Quote.draw(elapsed);

    Input.update(elapsed);

    time = now;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
