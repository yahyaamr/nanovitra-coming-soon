const canvas = document.querySelector(".particle-field");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let animationFrame = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(34, Math.min(92, Math.floor((width * height) / 17000)));
  particles = Array.from({ length: count }, (_, index) => createParticle(index / count));
}

function createParticle(seed = Math.random()) {
  const rightBias = Math.random() > 0.4;

  return {
    x: rightBias ? width * (0.45 + Math.random() * 0.55) : Math.random() * width,
    y: Math.random() * height,
    size: 1.2 + Math.random() * 3.8,
    speed: 0.12 + Math.random() * 0.36,
    drift: -0.15 + Math.random() * 0.3,
    alpha: 0.18 + Math.random() * 0.45,
    hue: seed > 0.68 ? 33 : 176,
    phase: Math.random() * Math.PI * 2,
  };
}

function drawParticle(particle, time) {
  const pulse = 0.72 + Math.sin(time * 0.0018 + particle.phase) * 0.28;
  const radius = particle.size * pulse;
  const gradient = ctx.createRadialGradient(
    particle.x,
    particle.y,
    0,
    particle.x,
    particle.y,
    radius * 4.2,
  );

  gradient.addColorStop(0, `hsla(${particle.hue}, 78%, 78%, ${particle.alpha})`);
  gradient.addColorStop(0.45, `hsla(${particle.hue}, 78%, 72%, ${particle.alpha * 0.22})`);
  gradient.addColorStop(1, `hsla(${particle.hue}, 78%, 72%, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, radius * 4.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawConnections() {
  ctx.lineWidth = 1;

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 126) {
        const opacity = (1 - distance / 126) * 0.12;
        ctx.strokeStyle = `rgba(31, 171, 172, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }
}

function render(time) {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift + Math.sin(time * 0.0008 + particle.phase) * 0.08;

    if (particle.y < -24) {
      particle.y = height + 24;
      particle.x = Math.random() * width;
    }

    if (particle.x < -28) {
      particle.x = width + 28;
    } else if (particle.x > width + 28) {
      particle.x = -28;
    }

    drawParticle(particle, time);
  });

  drawConnections();
  animationFrame = requestAnimationFrame(render);
}

function start() {
  cancelAnimationFrame(animationFrame);
  if (prefersReducedMotion.matches) {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  animationFrame = requestAnimationFrame(render);
}

resize();
start();

window.addEventListener("resize", resize);
prefersReducedMotion.addEventListener("change", start);
