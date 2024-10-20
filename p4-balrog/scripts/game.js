const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

(async () => {
  await Quote.load();
  await Balrog.load();

  let time = performance.now();
  function tick() {
    const now = performance.now();
    const elapsed = now - time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    Quote.update(elapsed);
    Quote.draw(elapsed);

    Balrog.update(elapsed);
    Balrog.draw(elapsed);

    Input.update(elapsed);

    time = now;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
