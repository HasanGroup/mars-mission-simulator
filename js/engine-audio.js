'use strict';

function createEngineAudio(context) {
  const noise = context.createBufferSource();
  const length = context.sampleRate * 4;
  noise.buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = noise.buffer.getChannelData(0);
  for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;
  noise.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = .65;
  const air = context.createGain();
  const vibration = context.createGain();
  const pulse = context.createGain();
  air.gain.value = vibration.gain.value = 0;
  pulse.gain.value = .88;

  const bass = context.createOscillator();
  bass.type = 'triangle';
  bass.frequency.value = 42;
  const lfo = context.createOscillator();
  lfo.frequency.value = 7;
  const depth = context.createGain();
  depth.gain.value = .09;

  noise.connect(filter);
  filter.connect(air);
  air.connect(pulse);
  bass.connect(vibration);
  vibration.connect(pulse);
  lfo.connect(depth);
  depth.connect(pulse.gain);
  pulse.connect(context.destination);
  noise.start();
  bass.start();
  lfo.start();

  let previousThrust, previousDensity;
  return {
    update(thrust, density) {
      if (thrust === previousThrust && Math.abs(density - previousDensity) < .002) return;
      previousThrust = thrust;
      previousDensity = density;
      const now = context.currentTime;
      filter.frequency.setTargetAtTime(95 + 2300 * density, now, .12);
      air.gain.setTargetAtTime(.22 * thrust * density, now, .08);
      vibration.gain.setTargetAtTime(.073 * thrust * (.35 + .65 * density), now, .09);
      bass.frequency.setTargetAtTime(34 + 20 * thrust, now, .12);
    }
  };
}
