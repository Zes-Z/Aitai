import type { ThemeId } from '../types';

type Star = { x: number; y: number; r: number; a: number; p: number; s: number };
type Cloud = { x: number; y: number; w: number; h: number; a: number; s: number };
type Mote = { x: number; y: number; r: number; p: number; s: number };
type Bird = { x: number; y: number; s: number; p: number; flap: number };

const palette = {
  star: { star: '#e9ecff', glow: '#8fb3ff', gold: '#ffd9a0' },
  sea: { star: '#dcebff', glow: '#6fe7de', gold: '#fff6e6' },
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
  let clouds: Cloud[] = [];
  let motes: Mote[] = [];
  let birds: Bird[] = [];
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
    clouds = Array.from({ length: Math.round(5 * count) }, () => ({
      x: Math.random(),
      y: rand(0.1, 0.52),
      w: rand(0.1, 0.32) * w,
      h: rand(18, 52),
      a: rand(0.025, 0.07),
      s: rand(0.15, 0.7),
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

    shooting.wait -= 0.016;
    if (shooting.life <= 0 && shooting.wait <= 0) {
      shooting = {
        x: rand(0.1, 0.7) * w,
        y: rand(0.05, 0.4) * h,
        vx: rand(5, 9),
        vy: rand(1.4, 2.6),
        life: 1,
        wait: rand(5, 10),
      };
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
    const horizon = h * 0.58;
    const mx = w * 0.84 + pointerX * 10;
    const my = h * 0.2 + pointerY * 8;
    const moonR = Math.min(w, h) * 0.05;

    ctx.save();

    // sea body
    const sea = ctx.createLinearGradient(0, horizon, 0, h);
    sea.addColorStop(0, 'rgba(6, 32, 42, 0.3)');
    sea.addColorStop(0.35, 'rgba(3, 16, 24, 0.55)');
    sea.addColorStop(1, 'rgba(1, 6, 10, 0.82)');
    ctx.globalAlpha = fade;
    ctx.fillStyle = sea;
    ctx.fillRect(0, horizon, w, h - horizon);

    // horizon glow
    const horizonGlow = ctx.createLinearGradient(0, horizon - 34, 0, horizon + 34);
    horizonGlow.addColorStop(0, 'rgba(220, 235, 255, 0)');
    horizonGlow.addColorStop(0.5, 'rgba(220, 235, 255, 0.2)');
    horizonGlow.addColorStop(1, 'rgba(111, 231, 222, 0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, horizon - 34, w, 68);

    // slow clouds across the sky
    ctx.globalCompositeOperation = 'source-over';
    for (const cloud of clouds) {
      const x = (((cloud.x + t * cloud.s * 0.004) % 1.2) - 0.1) * w;
      const y = cloud.y * h;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, cloud.w);
      grad.addColorStop(0, 'rgba(220, 235, 255, ' + cloud.a * fade + ')');
      grad.addColorStop(1, 'rgba(220, 235, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'lighter';

    // stars reflected in the upper sky
    for (const s of stars) {
      if (s.y > 0.54) continue;
      const x = s.x * w + pointerX * 8;
      const y = s.y * h + pointerY * 6;
      const tw = 0.5 + 0.5 * Math.sin(t * s.s + s.p);
      ctx.globalAlpha = s.a * tw * 0.7 * fade;
      ctx.fillStyle = c.star;
      ctx.beginPath();
      ctx.arc(x, y, s.r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }

    // moon glow
    const glow = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(w, h) * 0.46);
    glow.addColorStop(0, 'rgba(220, 235, 255, 0.3)');
    glow.addColorStop(0.24, 'rgba(111, 231, 222, 0.12)');
    glow.addColorStop(1, 'rgba(111, 231, 222, 0)');
    ctx.globalAlpha = fade;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // the moon
    const disc = ctx.createRadialGradient(
      mx - moonR * 0.35, my - moonR * 0.35, moonR * 0.08,
      mx, my, moonR
    );
    disc.addColorStop(0, '#fffaf0');
    disc.addColorStop(0.7, '#e9f2f6');
    disc.addColorStop(1, '#cfe3ea');
    ctx.globalAlpha = 0.02 * fade;
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(mx, my, moonR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.0 * fade;
    ctx.fillStyle = '#9fb8c4';
    ctx.beginPath();
    ctx.arc(mx - moonR * 0.3, my + moonR * 0.22, moonR * 0.14, 0, Math.PI * 2);
    ctx.arc(mx + moonR * 0.28, my - moonR * 0.3, moonR * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // moon path on the water
    const pathW = Math.max(44, w * 0.15);
    for (let i = 0; i < 34; i++) {
      const p = i / 34;
      const y = horizon + p * (h - horizon);
      const spread = pathW * (0.25 + p * 1.55);
      const a = (1 - p) * 0.22 * (0.55 + 0.45 * Math.sin(t * 1.3 + i * 0.9));
      ctx.globalAlpha = a * fade;
      ctx.fillStyle = c.gold;
      ctx.beginPath();
      ctx.ellipse(
        mx + Math.sin(i * 2.3 + t * 0.7) * spread * 0.12,
        y,
        spread,
        1.1 + p * 2.6,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // long, slow tide lines
    for (let i = 0; i < 24; i++) {
      const p = i / 24;
      const y = horizon + p * (h - horizon);
      const amp = 1.4 + p * 7;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 14) {
        const wave = y + Math.sin((x / w) * Math.PI * 5 + t * (0.35 + p * 0.5) + i * 0.7) * amp;
        if (x === 0) ctx.moveTo(x, wave);
        else ctx.lineTo(x, wave);
      }
      ctx.globalAlpha = (0.065 + p * 0.13) * fade;
      ctx.strokeStyle = i % 4 === 0 ? c.gold : c.star;
      ctx.lineWidth = i % 4 === 0 ? 1 : 0.6;
      ctx.stroke();
    }

    // a small boat on the moon path
    ctx.globalCompositeOperation = 'source-over';
    const bx = mx - 26;
    const by = horizon + 4;
    ctx.globalAlpha = 0.42 * fade;
    ctx.fillStyle = '#02070b';
    ctx.beginPath();
    ctx.moveTo(bx - 16, by);
    ctx.lineTo(bx + 16, by);
    ctx.lineTo(bx + 9, by + 5);
    ctx.lineTo(bx - 11, by + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(bx - 1, by - 14, 2, 14);
    ctx.beginPath();
    ctx.moveTo(bx + 1, by - 14);
    ctx.lineTo(bx + 11, by - 2);
    ctx.lineTo(bx + 1, by - 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawDawn(t: number) {
    const c = palette.dawn;
    ctx.save();

    const sx = w * 0.72;
    const sy = h * 0.22;
    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(w, h) * 0.55);
    sun.addColorStop(0, 'rgba(242,200,121,0.5)');
    sun.addColorStop(0.35, 'rgba(233,139,106,0.2)');
    sun.addColorStop(1, 'rgba(233,139,106,0)');
    ctx.globalAlpha = fade;
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);

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

    for (const m of motes) {
      const x = m.x * w + Math.sin(t * m.s + m.p) * 18;
      const y = m.y * h + Math.cos(t * m.s * 0.7 + m.p) * 12;
      ctx.globalAlpha = (0.18 + 0.2 * Math.sin(t + m.p)) * fade;
      ctx.fillStyle = c.star;
      ctx.beginPath();
      ctx.arc(x, y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = c.star;
    ctx.lineWidth = 1;
    for (const b of birds) {
      const x = ((b.x * w + t * 7) % (w + 100)) - 50;
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
    if (theme === 'star') return;
    if (theme === 'sea') drawSea(t);
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
