import { siteConfig } from '../../SiteConfig';
import type { ThemeId } from '../types';
import { isTheme } from '../theme/palettes';
import { orbFragmentShader, orbVertexShader } from '../theme/orb-shaders';
import { createOrbFallback } from '../theme/orb-fallback';

type OrbScene = 'sea' | 'star' | 'dawn';
type Painter = { draw(scene: OrbScene, time: number): void; dispose(): void };
let mounted: { canvas: HTMLCanvasElement; sync(): void; stop(): void; dispose(): void } | undefined;
let bound = false;

function gpuPainter(canvas: HTMLCanvasElement): Painter | null {
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power', preserveDrawingBuffer: true,
  });
  if (!gl) return null;
  const shader = (type: number, source: string) => {
    const handle = gl.createShader(type);
    if (!handle) throw new Error('Unable to allocate orb shader');
    gl.shaderSource(handle, source); gl.compileShader(handle);
    if (!gl.getShaderParameter(handle, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(handle); gl.deleteShader(handle); throw new Error(message || 'Unable to compile orb shader');
    }
    return handle;
  };
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) throw new Error('Unable to allocate orb renderer');
  const vertex = shader(gl.VERTEX_SHADER, orbVertexShader);
  const fragment = shader(gl.FRAGMENT_SHADER, orbFragmentShader);
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Unable to link orb renderer');
  gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'uResolution');
  const time = gl.getUniformLocation(program, 'uTime');
  const scene = gl.getUniformLocation(program, 'uScene');
  canvas.dataset.renderer = 'webgl';
  return {
    draw(theme, seconds) {
      gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(program);
      gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform1f(time, seconds);
      gl.uniform1f(scene, theme === 'sea' ? 0 : theme === 'star' ? 1 : 2); gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() { gl.deleteBuffer(buffer); gl.deleteProgram(program); },
  };
}

function mount(initialCanvas: HTMLCanvasElement) {
  let canvas = initialCanvas;
  let painter: Painter | null = null;
  let theme: ThemeId = siteConfig.theme.default;
  let elapsed = 0, last = 0, frame = 0;
  let visible = true, lost = false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
  const draw = () => {
    if (theme === 'dawn' || lost) return;
    if (!painter) {
      try { painter = gpuPainter(canvas); }
      catch (error) {
        console.warn('Orb WebGL fallback:', error);
        resize.unobserve(canvas); intersection.unobserve(canvas);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
        canvas.replaceWith(replacement); canvas = replacement;
        attachCanvas();
      }
      if (!painter) { painter = createOrbFallback(canvas); canvas.dataset.renderer = 'canvas-2d'; }
    }
    const pixels = Math.min(320, Math.max(128, Math.round((canvas.clientWidth || 96) * Math.min(devicePixelRatio || 1, 2))));
    if (canvas.width !== pixels || canvas.height !== pixels) { canvas.width = pixels; canvas.height = pixels; }
    painter?.draw(theme, reduce.matches ? 0 : elapsed);
  };
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    if (last && now - last < 1000 / 30) return;
    if (last) elapsed += Math.min((now - last) / 1000, .1);
    last = now; draw();
  };
  const sync = () => {
    stop();
    const value = document.documentElement.dataset.theme;
    const next = isTheme(value) ? value : siteConfig.theme.default;
    if (next !== theme) { theme = next; elapsed = 0; }
    if (theme === 'dawn' || document.hidden || !visible || lost) return;
    draw();
    if (!reduce.matches) frame = requestAnimationFrame(loop);
  };
  const onLost = (event: Event) => { event.preventDefault(); lost = true; stop(); };
  const onRestored = () => { lost = false; painter = null; sync(); };
  const resize = new ResizeObserver(() => { if (!document.hidden && visible) draw(); });
  const intersection = new IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.target === canvas);
    if (entry) { visible = entry.isIntersecting; sync(); }
  });
  function attachCanvas() {
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    resize.observe(canvas); intersection.observe(canvas);
  }
  attachCanvas(); reduce.addEventListener('change', sync);
  return {
    get canvas() { return canvas; }, sync, stop,
    dispose() {
      stop(); painter?.dispose(); resize.disconnect(); intersection.disconnect();
      reduce.removeEventListener('change', sync);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    },
  };
}

export function initOrbArt() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-orb-canvas]');
  if (!canvas) return;
  if (mounted?.canvas !== canvas) { mounted?.dispose(); mounted = mount(canvas); }
  mounted?.sync();
  if (bound) return;
  bound = true;
  window.addEventListener('aitai:theme', () => mounted?.sync());
  document.addEventListener('visibilitychange', () => mounted?.sync());
  document.addEventListener('astro:before-swap', () => mounted?.stop());
  document.addEventListener('astro:after-swap', initOrbArt);
  window.addEventListener('pagehide', () => mounted?.stop());
  window.addEventListener('pageshow', () => mounted?.sync());
}
