import Context from "./global.js";

export class Figure {
  constructor({ x, y, scale, speed, end, initialTime }) {
    this.width = Context.canvas.width;
    this.height = Context.canvas.height;
    this.pointArray = [];
    this.startAt(initialTime);
    this.placeAt(x, y);
    this.scaleBy(scale);
    this.accelerateBy(speed);
    this.endAnimationIn(end);
  }

  startAt(t) {
    this.initialTime = t;
  }

  placeAt(x, y) {
    this.xoffset = x;
    this.yoffset = y;
  }

  scaleBy(factor) {
    this.scale = factor;
  }

  accelerateBy(factor) {
    this.speedFactor = factor;
  }

  endAnimationIn(tmax) {
    this.tmax = tmax;
  }

  animationEnded(t) {
    return (t - this.initialTime) > this.tmax;
  }

  transformx(x) {
    return x * this.scale + this.xoffset;
  }

  transformy(y) {
    return y * this.scale + this.height - this.yoffset;
  }

  offsetX() {
    return this.xoffset;
  }

  offsetY() {
    return this.yoffset;
  }

  registerPoint(t) {
    this.pointArray.push([this.x(t), this.height - this.y(t)]);
  }

  points() {
    return this.pointArray;
  }

  draw(transformedPoints) {}
}

export class Heart extends Figure {
  constructor(args) {
    super(args);
  }

  x(t) {
    t -= this.initialTime;
    t *= this.speedFactor;
    return this.transformx(16 * Math.pow(Math.sin(t), 3));
  }

  y(t) {
    t -= this.initialTime;
    t *= this.speedFactor;
    return this.transformy(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  }

  draw(transformedPoints) {

    transformedPoints = transformedPoints || this.pointArray;

    Context.ctx.lineWidth = 3;
    Context.ctx.strokeStyle = "red";

    Context.ctx.beginPath();

    if (transformedPoints.length > 1) {
      const [x, y] = transformedPoints[0];
      Context.ctx.moveTo(x, y);
    }

    for (const [x, y] of transformedPoints.slice(1))
      Context.ctx.lineTo(x, y);

    Context.ctx.stroke();
  }
}

export class Rose extends Figure {
  constructor({ color, n, ...rest }) {
    super(rest);
    this.color = color;
    this.n = n;
  }

  r(t) {
    return Math.cos(this.n * t);
  }

  x(t) {
    t -= this.initialTime;
    t *= this.speedFactor;
    return this.transformx(this.r(t) * Math.cos(t));
  }

  y(t) {
    t -= this.initialTime;
    t *= this.speedFactor;
    return this.transformy(this.r(t) * Math.sin(t));
  }

  registerPoint(t) {
    super.registerPoint(t);
  }

  draw(transformedPoints) {

    transformedPoints = transformedPoints || this.pointArray;

    Context.ctx.lineWidth = 3;
    Context.ctx.strokeStyle = this.color;

    Context.ctx.beginPath();

    if (transformedPoints.length > 1) {
      const [x, y] = transformedPoints[0];
      Context.ctx.moveTo(x, y);
    }

    for (const [x, y] of transformedPoints.slice(1))
      Context.ctx.lineTo(x, y);

    Context.ctx.stroke();
  }
}

export class Rotator extends Figure {
  constructor({ child, anglePerTick, ...args }) {
    super(args);
    this.child = child;
    this.childEnded = false;
    this.anglePerTick = anglePerTick;
    this.angle = 0;
  }

  animationEnded(t) {
    if (this.child.animationEnded(t))
      this.childEnded = true;

    return false;
  }

  transformx(x) {
    return this.child.transformx(x);
  }

  transformy(y) {
    return this.child.transformy(y);
  }

  offsetX() {
    return this.child.offsetX();
  }

  offsetY() {
    return this.child.offsetY();
  }

  registerPoint(t) {
    this.angle += this.anglePerTick;

    if (!this.childEnded)
      this.child.registerPoint(t);
  }

  points() {
    const cx = this.child.offsetX();
    const cy = this.child.offsetY();

    return this.child.points()
      .map(([x, y]) => [x - cx, y - cy])
      .map(([x, y]) => [
        x * Math.cos(this.angle) - y * Math.sin(this.angle),
        x * Math.sin(this.angle) + y * Math.cos(this.angle),
      ])
      .map(([x, y]) => [x + cx, y + cy]);
  }

  draw(transformedPoints) {
    this.child.draw(transformedPoints || this.points());
  }
}

export class Scaler extends Figure {
  constructor({ child, scalePerTick, ...args }) {
    super(args);
    this.child = child;
    this.childEnded = false;
    this.scalePerTick = scalePerTick;
    this.scale = 1;
  }

  animationEnded(t) {
    if (this.child.animationEnded(t))
      this.childEnded = true;

    return false;
  }

  transformx(x) {
    return this.child.transformx(x);
  }

  transformy(y) {
    return this.child.transformy(y);
  }

  offsetX() {
    return this.child.offsetX();
  }

  offsetY() {
    return this.child.offsetY();
  }

  registerPoint(t) {
    this.scale *= this.scalePerTick;

    if (!this.childEnded)
      this.child.registerPoint(t);
  }

  points() {
    const cx = this.child.offsetX();
    const cy = this.child.offsetY();

    return this.child.points()
      .map(([x, y]) => [x - cx, y - cy])
      .map(([x, y]) => [x * this.scale, y * this.scale])
      .map(([x, y]) => [x + cx, y + cy]);
  }

  draw(transformedPoints) {
    this.child.draw(transformedPoints || this.points());
  }
}

export class MoverAway extends Figure {
  constructor({ child, acceleration, fromx, fromy, ...args }) {
    super(args);
    this.child = child;
    this.childEnded = false;
    this.acceleration = acceleration;
    this.position = 0;
    this.speed = 0;
    this.fromx = fromx;
    this.fromy = fromy;
  }

  animationEnded(t) {
    if (this.child.animationEnded(t))
      this.childEnded = true;

    return false;
  }

  transformx(x) {
    return this.child.transformx(x);
  }

  transformy(y) {
    return this.child.transformy(y);
  }

  offsetX() {
    return this.child.offsetX();
  }

  offsetY() {
    return this.child.offsetY();
  }

  registerPoint(t) {
    if (!this.childEnded)
      this.child.registerPoint(t);

    this.speed += this.acceleration;
    this.position += this.acceleration;
  }

  points() {
    return this.child.points()
      .map(([x, y]) => [
        x + (x - this.fromx) * this.position,
        y + (y - this.fromy) * this.position
      ]);
  }

  draw(transformedPoints) {
    this.child.draw(transformedPoints || this.points());
  }
}

/**
 * Must be used as the outermost decorator.
 * Since its animation ends, and that's how
 * the animation loop knows to remove it.
 */
export class Fader extends Figure {
  constructor({ child, fadeTime, ...args }) {
    super(args);
    this.child = child;
    this.fadeTime = fadeTime;
    this.alpha = 1;
  }

  computeNewAlpha(t) {
    return 1 - (t - this.initialTime) / this.fadeTime;
  }

  animationEnded(t) {
    return this.computeNewAlpha(t) <= 0;
  }

  transformx(x) {
    return this.child.transformx(x);
  }

  transformy(y) {
    return this.child.transformy(y);
  }

  registerPoint(t) {
    if (!this.child.animationEnded(t))
      this.child.registerPoint(t);

    this.alpha = this.computeNewAlpha(t);
  }

  points() {
    return this.child.points();
  }

  draw() {
    Context.ctx.globalAlpha = this.alpha;
    this.child.draw();
    Context.ctx.globalAlpha = 1;
  }
}
