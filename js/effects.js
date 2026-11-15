'use strict';

function createFlightCamera() {
  let x = 0, y = 0, shake = 0, time = 0;
  return {
    addShake(intensity) { shake = Math.max(shake, intensity); },
    reset() { x = y = shake = 0; },
    update(dt, targetX, targetY) {
      const blend = 1 - Math.exp(-4 * dt);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      shake *= Math.exp(-9 * dt);
      time += dt;
    },
    position() { return { x, y }; },
    offset() {
      return { x: x + Math.sin(time * 83) * shake, y: y + Math.cos(time * 107) * shake * .65 };
    }
  };
}

function createFlightParticles() {
  const particles = [];
  let spawnTimer = 0;
  const interval = 1 / 30;
  const rand = (min, max) => min + Math.random() * (max - min);

  function burst(kind, x, y, count, dx = 0, dy = 1) {
    for (let i = 0; i < count && particles.length < 550; i++) {
      const smoke = kind === 'smoke', plasma = kind === 'plasma';
      const speed = smoke ? rand(13, 65) : rand(75, 245);
      const life = smoke ? rand(1.1, 2.8) : rand(.11, plasma ? .48 : .32);
      particles.push({
        kind, x: x + rand(-4, 4), y: y + rand(-3, 3),
        vx: dx * speed + rand(-32, 32), vy: dy * speed + rand(-26, 26),
        life, maxLife: life, size: smoke ? rand(8, 23) : kind === 'spark' ? rand(1, 3) : rand(4, 10)
      });
    }
  }
  function update(dt, ground, emit) {
    spawnTimer += dt;
    while (spawnTimer + 1e-10 >= interval) {
      spawnTimer -= interval;
      emit(burst);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles[i] = particles[particles.length - 1];
        particles.pop();
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'smoke') {
        const floor = ground - Math.min(20, p.size * .6);
        p.vy += 23 * dt;
        if (p.y >= floor) {
          p.y = floor;
          p.vy = Math.min(0, -p.vy * .12);
          p.vx += Math.sign(p.vx || 1) * 32 * dt;
        }
      }
    }
  }
  function draw(ctx) {
    ctx.save();
    for (const smokePass of [true, false]) {
      ctx.globalCompositeOperation = smokePass ? 'source-over' : 'lighter';
      for (const p of particles) {
        const smoke = p.kind === 'smoke';
        if (smoke !== smokePass) continue;
        const life = p.life / p.maxLife;
        const size = p.size * (1 + (1 - life) * (smoke ? 2 : p.kind === 'plasma' ? 2.5 : .45));
        ctx.globalAlpha = life * (smoke ? .23 : .78);
        if (smoke) {
          ctx.fillStyle = '#c0c8d2';
        } else {
          const glow = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,size);
          glow.addColorStop(0,'#fff6dd');
          glow.addColorStop(.35,p.kind === 'rcs' ? '#91dcff' : p.kind === 'plasma' ? '#ff8c66' : '#ffc04f');
          glow.addColorStop(1,'#ff633000');
          ctx.fillStyle = glow;
        }
        ctx.beginPath();
        ctx.arc(p.x,p.y,size,0,Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  return { update, draw, clear() { particles.length = 0; spawnTimer = 0; } };
}
