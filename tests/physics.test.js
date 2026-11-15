'use strict';

(() => {
  const {calculateDynamicPressure: pressure, calculateMassProperties: mass, createFlightDynamics: dynamics} =
    typeof require === 'function' ? require('../js/dynamics.js') : {
      calculateDynamicPressure, calculateMassProperties, createFlightDynamics
    };
  const cases = [];
  function near(actual, expected, epsilon = 1e-8) {
    if (!(Math.abs(actual - expected) <= epsilon)) {
      throw new Error('Expected ' + expected + ', got ' + actual);
    }
  }
  function test(name, run) {
    try {
      run();
      cases.push({test:name, result:'PASS'});
    } catch (error) {
      cases.push({test:name, result:'FAIL', detail:error.message});
    }
  }
  test('Dynamic pressure in vacuum and at rest', () => {
    near(pressure(0, 20), 0);
    near(pressure(1.2, 0), 0);
  });
  test('Dynamic pressure scales with velocity squared', () => {
    near(pressure(1.2, 10), 60);
    near(pressure(1.2, 20), 240);
    near(pressure(1.2, -20), 240);
  });
  test('Dry mass, center of mass and inertia', () => {
    const dry = mass(0, 0);
    near(dry.mass, .45);
    near(dry.center, 13/30);
    near(dry.inertia, .14175);
  });
  test('Burnout shifts the center and reduces inertia', () => {
    const full = mass(0, 1), half = mass(0, .5), dry = mass(0, 0);
    near(full.mass - half.mass, .37);
    near(half.mass - dry.mass, .37);
    if (!(full.center < half.center && half.center < dry.center &&
          full.inertia > half.inertia && half.inertia > dry.inertia)) {
      throw new Error('Unexpected mass distribution during burnout');
    }
  });
  test('Stage separation changes mass and inertia', () => {
    near(mass(0, 1).mass - mass(1, 1).mass, .21);
    if (!(mass(1, 1).inertia < mass(0, 1).inertia)) throw new Error('Inertia did not decrease');
  });
  test('Overload threshold and throttle damage remain calibrated', () => {
    function tick(q, thrust) {
      const flight = dynamics();
      flight.update(1/120, {air:q, speed:1, thrust, stage:0, propellant:1, steer:0, path:0, entry:false, reference:0});
      near(flight.data.q, q);
      return flight.data.integrity;
    }
    near(tick(.38, 1), 1);
    near(tick(.58, 1), 1-.2*.25/120);
    near(tick(.58, .58), 1-.2*.12*.25/120);
  });
  console.table(cases);
  const failures = cases.filter(item => item.result === 'FAIL');
  if (typeof document !== 'undefined') {
    document.getElementById('results').textContent = cases.map(item =>
      item.result + '  ' + item.test + (item.detail ? ' — ' + item.detail : '')).join('\n');
  }
  if (failures.length) throw new Error(failures.length + ' physics test(s) failed');
})();
