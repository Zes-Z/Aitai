/**
 * Content depth field — adapted from funiki's 02 Life in Frames.
 * The justified wall remains the no-JS / reduced-motion fallback.
 */
const PERSPECTIVE = 900;
const SPACING = 300;
const VIEW_DEPTH = 2600;
const FOCAL = 700;
const SPAN = 0.9;
const MAX_BLUR = 8;
const SHARP_BAND = 380;
const BLUR_FALLOFF = 160;
const SCROLL_RATE = 1.9;
const MAGNET_RADIUS = 220;
const MAGNET_PULL = 0.12;
const MAGNET_MAX = 22;
const MAGNET_EASE = 420;
const LEAD = VIEW_DEPTH * 0.35;
/** Horizontal starting offset as a share of viewport width. >0 shifts right. */
const FIELD_OFFSET_X = 0.06;
const FOCAL_SCALE = PERSPECTIVE / (PERSPECTIVE + FOCAL);
const BLUR_STEPS = [0, 1, 2, 3.5, 5.5, 8, 12, 15, 19];

const random = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const wrap = (value: number) => value - Math.floor(value + 0.5);
const mod = (value: number, length: number) => ((value % length) + length) % length;
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
const blurStep = (current: number, blur: number) => {
  let i = Math.max(0, BLUR_STEPS.indexOf(current));
  while (i < BLUR_STEPS.length - 1 && blur > BLUR_STEPS[i] + (BLUR_STEPS[i + 1] - BLUR_STEPS[i]) * 0.7) i++;
  while (i > 0 && blur < BLUR_STEPS[i] - (BLUR_STEPS[i] - BLUR_STEPS[i - 1]) * 0.7) i--;
  return BLUR_STEPS[i];
};

interface Pose {
  x: number;
  y: number;
  s: number;
  d: number;
  opacity: number;
  blur: number;
}
interface DepthItem {
  el: HTMLElement;
  original: HTMLElement;
  ratio: number;
  u: number;
  v: number;
  d0: number;
  size: number;
  w: number;
  h: number;
  mx: number;
  my: number;
  hover: number;
  blur: number;
  hidden: boolean | null;
  z: number;
  pose: Pose | null;
}

export function initContentDepth(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const section = document.querySelector<HTMLElement>('[data-content-depth]');
  const wall = section?.querySelector<HTMLElement>('.content-wall');
  if (!section || !wall || section.dataset.depthReady === 'true') return;

  const tiles = Array.from(wall.querySelectorAll<HTMLElement>('.content-tile'));
  if (!tiles.length) return;

  section.dataset.depthReady = 'true';

  const track = document.createElement('div');
  track.className = 'depth-track';
  const stage = document.createElement('div');
  stage.className = 'depth-stage';
  const field = document.createElement('div');
  field.className = 'depth-field';
  stage.append(field);
  track.append(stage);
  wall.after(track);
  section.classList.add('is-depth');

  const items: DepthItem[] = [];
  let suppressClickUntil = 0;

  tiles.forEach((tile, index) => {
    const ratio = Number.parseFloat(getComputedStyle(tile).getPropertyValue('--r')) || 1.5;
    const image = tile.querySelector<HTMLImageElement>('img');
    const imageSrc = image?.currentSrc || image?.src || '';
    const label = tile.getAttribute('aria-label') ?? '';

    const el = document.createElement('button') as HTMLButtonElement;
    el.type = 'button';
    el.className = 'depth-item';
    el.setAttribute('aria-label', label);
    const sheetKey = tile.dataset.contentSheetTrigger;
    if (sheetKey) {
      el.dataset.contentSheetTrigger = sheetKey;
      el.setAttribute('aria-haspopup', 'dialog');
    }
    el.style.setProperty('--r', ratio.toFixed(4));
    el.style.setProperty('--p1', tile.style.getPropertyValue('--p1'));
    el.style.setProperty('--p2', tile.style.getPropertyValue('--p2'));
    el.style.setProperty('--p3', tile.style.getPropertyValue('--p3'));
    if (tile.classList.contains('content-tile--video')) el.classList.add('depth-item--video');

    if (imageSrc) {
      const clone = new Image();
      clone.src = imageSrc;
      clone.alt = '';
      clone.decoding = 'async';
      clone.loading = index < 4 ? 'eager' : 'lazy';
      el.append(clone);
    } else {
      const art = document.createElement('span');
      art.className = 'depth-art';
      art.setAttribute('aria-hidden', 'true');
      el.append(art);
    }
    const badge = tile.querySelector('[data-portfolio-badge]');
    if (badge) el.append(badge.cloneNode(true));

    el.addEventListener('click', (event) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      if (sheetKey) return; // The delegated sheet handler uses this visible card as its source.
      tile.click();
    });

    field.append(el);
    const seed = index * 7.13 + 1;
    items.push({
      el,
      original: tile,
      ratio,
      u: wrap(index * 0.7548777 + random(seed) * 0.12),
      v: wrap(index * 0.5698403 + random(seed + 3) * 0.12),
      d0: LEAD + index * SPACING + random(seed + 5) * 120,
      size: 0.7 + random(seed + 9) * 0.65,
      w: 0,
      h: 0,
      mx: 0,
      my: 0,
      hover: 0,
      blur: -1,
      hidden: null,
      z: -1,
      pose: null,
    });
  });

  const view = { w: 0, h: 0, small: false };
  const cam = { x: 0, y: 0, vx: 0, vy: 0, z: 0 };
  const loopLength = LEAD + tiles.length * SPACING + VIEW_DEPTH;
  let mouse: { x: number; y: number } | null = null;
  let hovered: DepthItem | null = null;
  let dragging = false;
  let dragPointer: { id: number; x: number; y: number; lastX: number; lastY: number; time: number; moved: boolean; pointerType: string } | null = null;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;

  const request = () => {
    if (frame || !visible) return;
    frame = requestAnimationFrame(loop);
  };

  const poseOf = (item: DepthItem): Pose => {
    const depth = mod(item.d0 - cam.z, loopLength);
    const s = PERSPECTIVE / (PERSPECTIVE + depth);
    const spread = Math.pow(s / FOCAL_SCALE, 0.6);
    const spanX = view.w * SPAN;
    const spanY = view.h * SPAN;
    const x = wrap(item.u - (cam.x * s) / spanX) * spanX * spread + view.w * FIELD_OFFSET_X;
    const y = wrap(item.v - (cam.y * s) / spanY) * spanY * spread;
    const opacity = smooth(40, 260, depth) * (1 - smooth(VIEW_DEPTH - 700, VIEW_DEPTH - 80, depth));
    const blur = Math.min(MAX_BLUR, Math.max(0, Math.abs(depth - FOCAL) - SHARP_BAND) / BLUR_FALLOFF);
    return { x, y, s, d: depth, opacity, blur };
  };

  const measure = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    view.w = w;
    view.h = h;
    view.small = w < 720;
    const lastDepth = LEAD + (tiles.length - 1) * SPACING + 120;
    const runway = Math.max(VIEW_DEPTH, lastDepth - 1250);
    const nextHeight = Math.round(h + runway / SCROLL_RATE);
    track.style.height = nextHeight + 'px';
    const base = (Math.min(w, h) * (view.small ? 0.5 : 0.36)) / FOCAL_SCALE;
    items.forEach((item) => {
      const iw = base * item.size * Math.sqrt(item.ratio);
      const ih = (base * item.size) / Math.sqrt(item.ratio);
      item.w = iw;
      item.h = ih;
      item.el.style.width = iw + 'px';
      item.el.style.height = ih + 'px';
      item.el.style.marginLeft = -iw / 2 + 'px';
      item.el.style.marginTop = -ih / 2 + 'px';
    });
    onScroll();
  };

  const render = (dt: number) => {
    elapsed += dt;
    if (!dragging) {
      cam.x += cam.vx * dt;
      cam.y += cam.vy * dt;
      const friction = Math.pow(0.0025, dt / 1000);
      cam.vx *= friction;
      cam.vy *= friction;
    }
    cam.x += Math.cos(elapsed / 6200) * 6 * 0.001 * dt;
    cam.y += Math.sin(elapsed / 9300) * 3.5 * 0.001 * dt;

    const box = stage.getBoundingClientRect();
    const centre = mouse ? { x: mouse.x - (box.left + box.width / 2), y: mouse.y - (box.top + box.height / 2) } : null;

    items.forEach((item) => {
      const pose = poseOf(item);
      item.pose = pose;
      let x = pose.x;
      let y = pose.y;
      let s = pose.s;
      let opacity = pose.opacity;
      let blur = pose.blur;

      const hoverGoal = item === hovered ? 1 : 0;
      item.hover += (hoverGoal - item.hover) * (1 - Math.exp(-dt / 140));
      blur *= 1 - item.hover;
      s *= 1 + 0.04 * item.hover;

      let pullX = 0;
      let pullY = 0;
      if (centre && !dragging) {
        const dx = centre.x - x;
        const dy = centre.y - y;
        const edge = Math.hypot(
          Math.max(0, Math.abs(dx) - (item.w * s) / 2),
          Math.max(0, Math.abs(dy) - (item.h * s) / 2)
        );
        const strength = (1 - smooth(0, MAGNET_RADIUS, edge)) * MAGNET_PULL;
        pullX = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx * strength));
        pullY = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy * strength));
      }
      const ease = 1 - Math.exp(-dt / MAGNET_EASE);
      item.mx += (pullX - item.mx) * ease;
      item.my += (pullY - item.my) * ease;
      x += item.mx;
      y += item.my;
      opacity += (1 - opacity) * item.hover * 0.5;

      const hidden =
        opacity < 0.01 ||
        Math.abs(x) - (item.w * s) / 2 > view.w / 2 + 24 ||
        Math.abs(y) - (item.h * s) / 2 > view.h * 1.5;
      if (hidden !== item.hidden) {
        item.el.style.visibility = hidden ? 'hidden' : '';
        item.hidden = hidden;
      }
      if (hidden) return;

      item.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, 0) scale(' + s.toFixed(4) + ')';
      item.el.style.opacity = opacity.toFixed(3);
      const step = blurStep(item.blur, blur);
      if (step !== item.blur) {
        item.el.style.filter = step < 0.5 ? 'none' : 'blur(' + step + 'px)';
        item.blur = step;
      }
      const z = Math.round(1200 - pose.d);
      if (z !== item.z) {
        item.el.style.zIndex = String(z);
        item.z = z;
      }
    });
  };

  const loop = (time: number) => {
    frame = 0;
    if (!track.isConnected || !visible) return;
    const dt = Math.min(48, lastTime ? time - lastTime : 16);
    lastTime = time;
    render(dt);
    request();
  };

  const onScroll = () => {
    if (!track.isConnected) return;
    const rect = track.getBoundingClientRect();
    cam.z = Math.max(0, -rect.top) * SCROLL_RATE;
    request();
  };

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    dragPointer = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, time: event.timeStamp, moved: false, pointerType: event.pointerType };
    cam.vx = 0;
    cam.vy = 0;
  });

  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse') {
      mouse = { x: event.clientX, y: event.clientY };
      request();
    }
    if (!dragPointer || event.pointerId !== dragPointer.id) return;
    const dx = event.clientX - dragPointer.lastX;
    const dy = event.clientY - dragPointer.lastY;
    if (!dragPointer.moved && Math.hypot(event.clientX - dragPointer.x, event.clientY - dragPointer.y) > 6) {
      dragPointer.moved = true;
      dragging = true;
      stage.classList.add('is-dragging');
    }
    if (!dragPointer.moved) return;
    const dt = Math.max(1, event.timeStamp - dragPointer.time);
    cam.x -= dx;
    cam.y -= dy;
    cam.vx = (-dx / dt) * 0.9;
    cam.vy = (-dy / dt) * 0.9;
    dragPointer.lastX = event.clientX;
    dragPointer.lastY = event.clientY;
    dragPointer.time = event.timeStamp;
    request();
  });

  const endDrag = (event: PointerEvent) => {
    if (!dragPointer || event.pointerId !== dragPointer.id) return;
    if (dragPointer.moved) suppressClickUntil = performance.now() + 350;
    dragPointer = null;
    dragging = false;
    stage.classList.remove('is-dragging');
    request();
  };
  window.addEventListener('pointerup', endDrag, { passive: true });
  window.addEventListener('pointercancel', endDrag, { passive: true });

  stage.addEventListener('pointerleave', () => { mouse = null; request(); });
  items.forEach((item) => {
    item.el.addEventListener('pointerenter', () => { hovered = item; request(); });
    item.el.addEventListener('pointerleave', () => { if (hovered === item) hovered = null; request(); });
  });

  const near = new IntersectionObserver((entries) => {
    if (!entries[0]) return;
    visible = entries[0].isIntersecting;
    if (!visible) return;
    lastTime = 0;
    request();
  }, { rootMargin: '100% 0px' });
  near.observe(section);

  const onResize = () => { measure(); };
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('astro:before-swap', () => {
    near.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
  }, { once: true });

  measure();
  onScroll();
  request();
}
