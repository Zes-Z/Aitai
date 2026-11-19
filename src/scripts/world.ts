import type { ThemeId } from '../types';

type Star = { x: number; y: number; r: number; a: number; p: number; s: number };
type Bubble = { x: number; y: number; r: number; s: number; p: number };
type Jelly = { x: number; y: number; r: number; p: number; s: number; hue: number };
type Mote = { x: number; y: number; r: number; p: number; s: number };
type Bird = { x: number; y: number; s: number; p: number; flap: number };
type Ray = { x: number; w: number; a: number; p: number };

const palette = {
  star: { star: '#e9ecff', glow: '#8fb3ff', gold: '#ffd9a0' },
  sea: { star: '#6fe7de', glow: '#2bc4c9', gold: '#dcebff' },
  dawn: { star: '#4f7fa8', glow: '#e98b6a', gold: '#f2c879' },
};

let started = false;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function initWorld() {
  if (started) return;
  const canvasEl = document.querySelector<HTMLCanvasElement>('#world-canvas');
  if (!canvasEl) return;
  started = true;

  const canvas: HTMLCanvasElement = canvasEl;
  const ctxEl = canvas.getContext('2d', { alpha: true });
  if (!ctxEl) return;
  const ctx: CanvasRenderingContext2D = ctxEl;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  let theme: ThemeId = (document.documentElement.dataset.theme as ThemeId) || 'star';
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let fade = 1;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  let stars: Star[] = [];
  let bubbles: Bubble[] = [];
  let jellies: Jelly[] = [];
  let motes: Mote[] = [];
  let birds: Bird[] = [];
  let rays: Ray[] = [];
  let shooting = { x: 0, y: 0, vx: 0, vy: 0, life: 0, wait: 2 };

  function build() {
    const count = mobile ? 0.4 : 1;
    stars = Array.from({ length: Math.round(680 * count) }, () => ({
      x: Math.random(),
      y: Math.random() * 0.92,
      r: rand(0.4, 1.8),
      a: rand(0.2, 0.95),
      p: rand(0, Math.PI * 2),
      s: rand(0.15, 1.1),
    }));
    bubbles = Array.from({ length: Math.round(80 * count) }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(0.8, 4),
      s: rand(0.008, 0.03),
      p: rand(0, Math.PI * 2),
    }));
    jellies = Array.from({ length: Math.round(16 * count) }, () => ({
      x: Math.random(),
      y: rand(0.1, 0.9),
      r: rand(14, 46),
      p: rand(0, Math.PI * 2),
      s: rand(0.2, 0.6),
      hue: rand(0, 1),
    }));
    motes = Array.from({ length: Math.round(90 * count) }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(0.5, 2.2),
      p: rand(0, Math.PI * 2),
      s: rand(0.1, 0.5),
    }));
    birds = Array.from({ length: Math.round(8 * count) }, () => ({
      x: Math.random(),
      y: rand(0.1, 0.6),
      s: rand(5, 12),
      p: rand(0, Math.PI * 2),
      flap: rand(0, Math.PI * 2),
    }));
    rays = Array.from({ length: 6 }, () => ({
      x: Math.random(),
      w: rand(0.04, 0.12),
      a: rand(0.02, 0.06),
      p: rand(0, Math.PI * 2),
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduce) draw(0);
  }

  function drawStars(t: number) {
    const c = palette.star;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of stars) {
      const x = s.x * w + pointerX * 14;
      const y = s.y * h + pointerY * 10;
      const tw = 0.55 + 0.45 * Math.sin(t * s.s + s.p);
      ctx.globalAlpha = s.a * tw * fade;
      ctx.fillStyle = c.star;
      ctx.beginPath();
      ctx.arc(x, y, s.r * (0.8 + tw * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // shooting star
    shooting.wait -= 0.016;
    if (shooting.life <= 0 && shooting.wait <= 0) {
      shooting = { x: rand(0.1, 0.7) * w, y: rand(0.05, 0.4) * h, vx: rand(5, 9), vy: rand(1.4, 2.6), life: 1, wait: rand(5, 10) };
    }
    if (shooting.life > 0) {
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;
      shooting.life -= 0.016;
      const grad = ctx.createLinearGradient(shooting.x, shooting.y, shooting.x - 90, shooting.y - 18);
      grad.addColorStop(0, 'rgba(233,236,255,0.9)');
      grad.addColorStop(1, 'rgba(143,179,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = Math.max(0, shooting.life) * fade;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x - 90, shooting.y - 18);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSea(t: number) {
    const c = palette.sea;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // caustic rays
    for (const ray of rays) {
      const x = ray.x * w + Math.sin(t * 0.1 + ray.p) * 40;
      const grad = ctx.createLinearGradient(x, 0, x + w * 0.18, h);
      grad.addColorStop(0, 'rgba(111,231,222,' + ray.a + ')');
      grad.addColorStop(1, 'rgba(111,231,222,0)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + ray.w * w, 0);
      ctx.lineTo(x + ray.w * w + 120, h);
      ctx.lineTo(x + 120, h);
      ctx.closePath();
      ctx.fill();
    }

    // jellyfish
    for (const j of jellies) {
      const x = j.x * w + Math.sin(t * j.s + j.p) * 26 + pointerX * 18;
      const y = j.y * h + Math.cos(t * j.s * 0.8 + j.p) * 18 + pointerY * 12;
      const r = j.r;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = (0.28 + j.hue * 0.28) * fade;
      ctx.fillStyle = c.star;
      ctx.shadowColor = c.glow;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.bezierCurveTo(-r, -r * 0.95, r, -r * 0.95, r, 0);
      ctx.bezierCurveTo(r * 0.6, r * 0.22, -r * 0.6, r * 0.22, -r, 0);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = c.star;
      ctx.globalAlpha = 0.16 * fade;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(k * r * 0.28, r * 0.05);
        ctx.bezierCurveTo(
          k * r * 0.2 + Math.sin(t + j.p + k) * 6, r * 0.7,
          k * r * 0.5 + Math.cos(t * 0.8 + j.p + k) * 8, r * 1.2,
          k * r * 0.3 + Math.sin(t * 0.6 + k) * 10, r * 1.8
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // bubbles
    for (const b of bubbles) {
      b.y -= b.s * 0.01;
      if (b.y < -0.05) b.y = 1.05;
      const x = b.x * w + Math.sin(t * 0.6 + b.p) * 12;
      const y = b.y * h;
      ctx.globalAlpha = 0.28 * fade;
      ctx.strokeStyle = c.gold;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, b.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDawn(t: number) {
    const c = palette.dawn;
    ctx.save();

    // sun glow
    const sx = w * 0.72;
    const sy = h * 0.22;
    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.55);
    sun.addColorStop(0, 'rgba(242,200,121,0.5)');
    sun.addColorStop(0.35, 'rgba(233,139,106,0.2)');
    sun.addColorStop(1, 'rgba(233,139,106,0)');
    ctx.globalAlpha = fade;
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

    // mist bands
    for (let i = 0; i < 3; i++) {
      const y = h * (0.42 + i * 0.12) + Math.sin(t * 0.08 + i) * 10;
      const grad = ctx.createLinearGradient(0, y, w, y + 30);
      grad.addColorStop(0, 'rgba(79,127,168,0)');
      grad.addColorStop(0.5, 'rgba(79,127,168,0.06)');
      grad.addColorStop(1, 'rgba(79,127,168,0)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = fade;
      ctx.fillRect(0, y, w, 40);
    }

    // motes
    for (const m of motes) {
      const x = m.x * w + Math.sin(t * m.s + m.p) * 18;
      const y = m.y * h + Math.cos(t * m.s * 0.7 + m.p) * 12;
      ctx.globalAlpha = (0.18 + 0.2 * Math.sin(t + m.p)) * fade;
      ctx.fillStyle = c.star;
      ctx.beginPath();
      ctx.arc(x, y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // birds
    ctx.strokeStyle = c.star;
    ctx.lineWidth = 1;
    for (const b of birds) {
      const x = (b.x * w + t * 7) % (w + 100) - 50;
      const y = b.y * h + Math.sin(t * 0.3 + b.p) * 8;
      const s = b.s;
      ctx.globalAlpha = 0.3 * fade;
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.quadraticCurveTo(x - s * 0.3, y - s * 0.55, x, y);
      ctx.quadraticCurveTo(x + s * 0.3, y - s * 0.55, x + s, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(t: number) {
    ctx.clearRect(0, 0, w, h);
    if (theme === 'star') drawStars(t);
    else if (theme === 'sea') drawSea(t);
    else drawDawn(t);
  }

  function loop(now: number) {
    if (!last) last = now;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    fade = Math.min(1, fade + dt * 1.4);
    pointerX += (targetX - pointerX) * 0.04;
    pointerY += (targetY - pointerY) * 0.04;
    draw(now / 1000);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (reduce) { draw(0); return; }
    if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const onPointer = (e: PointerEvent) => {
    targetX = (e.clientX / w - 0.5) * 2;
    targetY = (e.clientY / h - 0.5) * 2;
  };
  const onTheme = (e: Event) => {
    const detail = (e as CustomEvent<{ theme: ThemeId }>).detail;
    if (!detail?.theme) return;
    theme = detail.theme;
    fade = 0;
    if (reduce) draw(0);
  };
  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('aitai:theme', onTheme);
  document.addEventListener('visibilitychange', onVisibility);
  start();
}
