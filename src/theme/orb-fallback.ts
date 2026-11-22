/** Procedural Canvas fallback for devices without WebGL. */
export function createOrbFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const tau = Math.PI * 2;
  const smooth = (n: number) => { const x = Math.max(0, Math.min(1, n)); return x * x * (3 - 2 * x); };
  const tide = (time: number) => {
    const phase = ((time % 10) + 10) % 10;
    return phase < 2 ? 0 : phase < 5 ? smooth((phase - 2) / 3) : phase < 7 ? 1 : 1 - smooth((phase - 7) / 3);
  };
  const line = (x: number, t: number) => 1 - (0.22 + 0.97 * tide(t) - x * 0.1 + Math.sin(x * 8 + t * .7) * .028);

  function sea(t: number, size: number) {
    if (!ctx) return;
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, '#14313b'); sky.addColorStop(1, '#041424');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, size, size);
    const moon = ctx.createRadialGradient(size * .39, size * .28, 0, size * .47, size * .35, size * .265);
    moon.addColorStop(0, '#f4fff0'); moon.addColorStop(.55, '#d0e6e4'); moon.addColorStop(1, '#24465b');
    ctx.fillStyle = moon; ctx.beginPath(); ctx.arc(size * .47, size * .35, size * .255, 0, tau); ctx.fill();
    const path = (time: number) => {
      ctx.beginPath(); ctx.moveTo(0, size);
      for (let i = 0; i <= 48; i++) ctx.lineTo(i / 48 * size, line(i / 48, time) * size);
      ctx.lineTo(size, size); ctx.closePath();
    };
    path(t);
    const water = ctx.createLinearGradient(0, 0, size * .3, size);
    water.addColorStop(0, '#20788c'); water.addColorStop(.6, '#125165'); water.addColorStop(1, '#04192d');
    ctx.fillStyle = water; ctx.globalAlpha = .94; ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.clip();
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      for (let j = 0; j <= 40; j++) {
        const x = j / 40;
        const y = i / 7 + Math.sin(x * 19 - t * 1.2 + i) * .014;
        if (!j) ctx.moveTo(0, y * size); else ctx.lineTo(x * size, y * size);
      }
      ctx.strokeStyle = '#96e4da27'; ctx.lineWidth = size * .005; ctx.stroke();
    }
    ctx.restore(); ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const x = i / 64, y = line(x, t) + Math.sin(x * 103 + t) * .003;
      if (!i) ctx.moveTo(0, y * size); else ctx.lineTo(x * size, y * size);
    }
    ctx.strokeStyle = '#dbf3e8c0'; ctx.lineWidth = size * .01; ctx.stroke();
  }

  function hole(t: number, size: number) {
    if (!ctx) return;
    ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, size, size);
    const tilt = 1.2 + Math.sin(t * tau / 80) * .12, roll = -.3 + t * tau / 90;
    const project = (radius: number, angle: number) => {
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius * Math.cos(tilt);
      const z = Math.sin(angle) * radius * Math.sin(tilt);
      const perspective = size * .86 / (3.7 - z);
      return { x: size / 2 + (x * Math.cos(roll) - y * Math.sin(roll)) * perspective,
        y: size / 2 + (x * Math.sin(roll) + y * Math.cos(roll)) * perspective, z };
    };
    const disk = (front: boolean) => {
      for (let ring = 0; ring < 9; ring++) {
        const radius = 1.02 + ring * .1;
        for (let i = 0; i < 96; i++) {
          const a = i / 96 * tau, p = project(radius, a), q = project(radius, a + tau / 96);
          if ((p.z >= 0) !== front) continue;
          const light = .45 + .5 * Math.pow(.5 + .5 * Math.sin(a * 3 - t * .18 + ring * 1.7), 2);
          ctx.strokeStyle = 'rgba(255,' + (220 - ring * 12) + ',' + (151 - ring * 12) + ',' + light + ')';
          ctx.lineWidth = size * .011; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    };
    disk(false);
    ctx.shadowColor = '#f4b578'; ctx.shadowBlur = size * .035;
    ctx.strokeStyle = '#ffce94'; ctx.lineWidth = size * .012;
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size * .182, 0, tau); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#010107'; ctx.fill(); disk(true);
  }

  function dawn(t: number, size: number) {
    if (!ctx) return;
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, '#f5b58f'); sky.addColorStop(.55, '#ffd6ad'); sky.addColorStop(1, '#ffe6c8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, size, size);

    const cx = size * .5, cy = size * (.45 + .004 * Math.sin(t * .18));
    const radius = size * .29;
    const halo = ctx.createRadialGradient(cx, cy, radius * .2, cx, cy, radius * 2.1);
    halo.addColorStop(0, 'rgba(255,211,136,.46)'); halo.addColorStop(.45, 'rgba(255,164,92,.16)');
    halo.addColorStop(1, 'rgba(255,164,92,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, radius * 2.1, 0, tau); ctx.fill();

    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .008);
    for (let i = 0; i < 13; i++) {
      ctx.rotate(tau / 13);
      ctx.strokeStyle = 'rgba(255,220,155,.15)'; ctx.lineWidth = size * .006;
      ctx.beginPath(); ctx.moveTo(radius * 1.12, 0); ctx.lineTo(radius * 1.9, 0); ctx.stroke();
    }
    ctx.restore();

    const sun = ctx.createRadialGradient(cx - radius * .35, cy - radius * .32, radius * .05, cx, cy, radius);
    sun.addColorStop(0, '#fffdf0'); sun.addColorStop(.28, '#ffe9a9'); sun.addColorStop(.7, '#ffc45d');
    sun.addColorStop(1, '#e77a2d');
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, tau); ctx.fill();

    const horizon = size * .73;
    const water = ctx.createLinearGradient(0, horizon, 0, size);
    water.addColorStop(0, '#386e70'); water.addColorStop(.5, '#16434f'); water.addColorStop(1, '#061a28');
    ctx.fillStyle = water; ctx.beginPath(); ctx.moveTo(0, horizon);
    for (let i = 0; i <= 40; i++) {
      const x = i / 40;
      ctx.lineTo(x * size, horizon + Math.sin(x * 18 + t * .4) * size * .006);
    }
    ctx.lineTo(size, size); ctx.lineTo(0, size); ctx.closePath(); ctx.fill();

    ctx.save(); ctx.clip();
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      for (let j = 0; j <= 32; j++) {
        const x = j / 32;
        const y = horizon + (i + 1) / 10 * (size - horizon) + Math.sin(x * 21 - t * 1.1 + i) * size * .008;
        if (!j) ctx.moveTo(0, y); else ctx.lineTo(x * size, y);
      }
      ctx.strokeStyle = 'rgba(255,210,160,.1)'; ctx.lineWidth = size * .004; ctx.stroke();
    }
    const refl = ctx.createLinearGradient(cx - size * .16, 0, cx + size * .16, 0);
    refl.addColorStop(0, 'rgba(255,192,116,0)'); refl.addColorStop(.5, 'rgba(255,192,116,.24)');
    refl.addColorStop(1, 'rgba(255,192,116,0)');
    ctx.fillStyle = refl; ctx.fillRect(0, horizon, size, size - horizon);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,242,212,.42)'; ctx.lineWidth = size * .006;
    ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(size, horizon); ctx.stroke();
  }

  return {
    draw(scene: 'sea' | 'star' | 'dawn', time: number) {
      if (scene === 'sea') sea(time, canvas.width);
      else if (scene === 'star') hole(time, canvas.width);
      else dawn(time, canvas.width);
    },
    dispose() {},
  };
}
