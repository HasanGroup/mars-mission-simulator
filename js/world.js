'use strict';
const FlightWorld = (() => {
  const width = 600, height = 800;
  const step = 1 / 120;
  function spawnSatellite(viewWidth, viewHeight, random=Math.random) {
    // Screen-space margins cover the sprite, docking ring and HUD.
    const side=Math.min(.34, Math.max(.18, 78/viewWidth));
    const top=Math.min(.45, Math.max(.24, 155/viewHeight));
    const bottom=Math.max(.58, Math.min(.73, 1-85/viewHeight));
    return {x:width*(side+(1-2*side)*random()), y:height*(top+(bottom-top)*random())};
  }
  const contact = height * .82 - 15;
  function orbitalTargets(viewWidth, viewHeight, random=Math.random){
    const satellite=spawnSatellite(viewWidth,viewHeight,random);
    const x=satellite.x<width/2?.66:.22;
    return {satellite, waypoint:{x:width*(x+random()*.12),y:height*(.27+random()*.34)}};
  }
  function coastAxis(position, velocity, target, dt){
    // Exact step of a critically damped spring in the local orbital frame.
    const rate=1.65, offset=position-target, impulse=velocity+rate*offset;
    const decay=Math.exp(-rate*dt);
    return {position:target+(offset+impulse*dt)*decay, velocity:(velocity-rate*impulse*dt)*decay};
  }
  function clock(update, render) {
    let last, accumulator = 0;
    return time => {
      if (last !== undefined) accumulator += Math.min(.25, Math.max(0, (time - last) / 1000));
      last = time;
      while (accumulator + 1e-10 >= step) {
        update(step);
        accumulator -= step;
      }
      accumulator = Math.max(0, accumulator);
      render(accumulator / step);
    };
  }
  function interpolate(a, b, alpha) {
    return { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha,
      altitude: a.altitude + (b.altitude - a.altitude) * alpha,
      angle: a.angle + Math.atan2(Math.sin(b.angle-a.angle), Math.cos(b.angle-a.angle)) * alpha };
  }
  function ascentAcceleration(boosting, droppedMass, progress, vehicle, thrustBlend) {
    const remaining = Math.max(0, 1 - progress);
    const massScale = vehicle
      ? vehicle.dryMassScale * (1 - remaining * .25) + vehicle.propellantScale * remaining * .25
      : 1;
    const mass = (1 - droppedMass) * massScale;
    return (boosting ? .26 : .135) * (vehicle?.thrustScale ?? 1) * thrustBlend / mass - .075;
  }
  return { width, height, spawnSatellite, orbitalTargets, coastAxis, contact, clock, interpolate, ascentAcceleration };
})();
