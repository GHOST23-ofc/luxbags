// Renderer utility for black-hole canvas
export interface RendererOptions {
  canvas: HTMLCanvasElement;
}

export function createRenderer({ canvas }: RendererOptions) {
  const ctx = canvas.getContext("2d");
  let animationFrameId: number;
  let isRunning = true;

  const resize = () => {
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);

  let time = 0;
  const render = () => {
    if (!isRunning || !ctx) return;
    time += 0.02;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Glowing black hole vortex
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.min(cx, cy) * 0.8);
    grad.addColorStop(0, "#000000");
    grad.addColorStop(0.3, "rgba(227, 194, 116, 0.15)");
    grad.addColorStop(0.7, "rgba(56, 189, 248, 0.08)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(cx, cy) * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Orbital ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.3);
    ctx.strokeStyle = "rgba(227, 194, 116, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 16]);
    ctx.beginPath();
    ctx.ellipse(0, 0, 160, 60, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  return {
    ready: Promise.resolve(),
    dispose: () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    }
  };
}
