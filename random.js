import { Heart, Rose, Rotator, Scaler, Fader, MoverAway } from "./figures.js";
import Context from "./global.js";

const roseRotationProbability = 0.5;
const roseColors = ["green", "blue", "yellow", "orange", "purple", "pink"];
const roseNs = [3/4, Math.E, 3, Math.PI, 4, 5, 9, 10];
const heartProbability = 1 - roseNs.length / (roseNs.length + 1);
const initialScale = 5;
const scalePerTick = 1.002;
const fadeTime = 5;

export function faderFigure(fn) {
  // uses initial time to end animation
  return new Fader({
    initialTime: Context.t,
    child: fn(Context.t),
    fadeTime
  });
}

export function scaler(figure) {
  return new Scaler({
    scalePerTick,
    child: figure,
  });
}

export function mover(figure) {
  return new MoverAway({
    acceleration: 0.0015,
    fromx: Context.canvas.width / 2,
    fromy: Context.canvas.height / 2,
    child: figure,
  });
}

export function randomMovingFigure(initialTime) {
  if (Math.random() < heartProbability)
    return mover(scaler(randomHeart(initialTime)));

  return mover(scaler(randomlyRotate(randomRose(initialTime))));
}

export function randomRose(initialTime = 0) {
  const [x, y] = randomPosition();
  const scale = initialScale * 5;
  const speed = randomBetween(3, 4);
  const color = randomSelect(roseColors);

  const n = randomSelect(roseNs);

  const end = Math.floor(n) === n
    ? (Math.PI * 2 * n) / speed
    : (Math.PI * 2 * 10) / speed;

  return new Rose({ x, y, scale, speed, end, n, color, initialTime })
}

export function randomHeart(initialTime = 0) {
  const [x, y] = randomPosition();
  const scale = initialScale / 2;
  const speed = randomBetween(4, 10);
  const end = Math.PI * 2 / speed;
  return new Heart({ x, y, scale, speed, end, initialTime })
}

export function randomlyRotate(figure) {
  if (Math.random() < roseRotationProbability)
    return new Rotator({
      anglePerTick: randomBetween(0.01, 0.05),
      child: figure,
    });

  return figure;
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomSelect(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const p = 1e9 + 7;

let initial = Math.floor(p * Math.random());

export function randomPosition() {

  initial = (initial * 997 + 17) % p;

  return [
    initial % Context.canvas.width,
    Math.floor(initial / Context.canvas.width) % Context.canvas.height
  ];
}