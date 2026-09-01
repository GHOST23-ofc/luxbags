// ==========================================================================
// BASTION AI - BLACK HOLE & CYBER SNEAKER MATRIX CANVAS ENGINE
// ==========================================================================

class BlackHoleCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.particleCount = 120;
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, radius: 200, isHovered: false };
    this.time = 0;
    this.colors = ["#e3c274", "#38bdf8", "#a855f7", "#ccff00", "#ffffff"];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.isHovered = true;
    });
    window.addEventListener("mouseleave", () => {
      this.mouse.isHovered = false;
      this.mouse.x = this.width / 2;
      this.mouse.y = this.height / 2;
    });

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.max(this.width, this.height) * 0.6 + 60;
    return {
      x: this.width / 2 + Math.cos(angle) * distance,
      y: this.height / 2 + Math.sin(angle) * distance,
      angle: angle,
      distance: distance,
      speed: 0.003 + Math.random() * 0.008,
      size: Math.random() * 2.2 + 0.6,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * Math.PI
    };
  }

  animate() {
    this.time += 0.02;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height * 0.38; // Centrado hacia el hero

    // 1. Accretion Disk / Halo de Singularidad
    const grad = this.ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 380);
    grad.addColorStop(0, "rgba(5, 6, 8, 0.95)");
    grad.addColorStop(0.2, "rgba(227, 194, 116, 0.08)");
    grad.addColorStop(0.5, "rgba(56, 189, 248, 0.04)");
    grad.addColorStop(0.8, "rgba(168, 85, 247, 0.02)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 380, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Anillo de Event Horizon
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.time * 0.2);
    this.ctx.strokeStyle = "rgba(227, 194, 116, 0.15)";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([8, 14]);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 180, 75, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 260, 110, Math.PI / 4, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // 3. Partículas Orbitantes con Gravedad Relativista
    this.particles.forEach((p) => {
      p.angle += p.speed;
      p.distance -= 0.22; // Espiral hacia el centro

      if (p.distance < 40) {
        p.distance = Math.random() * Math.max(this.width, this.height) * 0.55 + 200;
      }

      // Deformación orbital
      const orbitX = centerX + Math.cos(p.angle) * p.distance;
      const orbitY = centerY + Math.sin(p.angle) * (p.distance * 0.45);

      // Efecto mouse repulsión/atracción
      let finalX = orbitX;
      let finalY = orbitY;
      if (this.mouse.isHovered) {
        const dx = this.mouse.x - orbitX;
        const dy = this.mouse.y - orbitY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          finalX += (dx / dist) * force * 35;
          finalY += (dy / dist) * force * 35;
        }
      }

      const pulseOpacity = (Math.sin(this.time * 2 + p.pulse) + 1) * 0.35 + 0.3;

      this.ctx.beginPath();
      this.ctx.arc(finalX, finalY, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha * pulseOpacity;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1;
    });

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new BlackHoleCanvas("black-hole-canvas");
});
