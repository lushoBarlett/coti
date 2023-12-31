import { setup2DCanvas } from "./lib.js";
import { randomMovingFigure, faderFigure } from "./random.js";
import Context from "./global.js";

const spawnProbabilityPerTick = 0.2;
const entityLimit = 250;

const secret = [191, 78, 111, 115, 32, 67, 97, 115, 97, 109, 111, 115, 63];
const oldTitle = document.title;

let textAlpha = 0;
let textOffsetY = 0;
let altTextAlpha = 0;

setInterval(() => {
  const old = document.title;
  document.title = secret.map(c => String.fromCharCode(c)).join("");
  setTimeout(() => document.title = old, 2000);
}, 10000);

document.addEventListener('DOMContentLoaded', () => {
  let { canvas: c, ctx: g } = setup2DCanvas();

  Context.canvas = c;
  Context.ctx = g;

  window.addEventListener("resize", () => {
    Context.ctx.fillStyle = "black";
    Context.ctx.fillRect(0, 0, Context.canvas.width, Context.canvas.height);

    Context.canvas.width = window.innerWidth;
    Context.canvas.height = window.innerHeight;
  });

  setupAction({ start: 5000, interval: 10, action: () => {
    textAlpha = textAlpha === 0 ? 0.01 : textAlpha * 1.02;
    textOffsetY = Math.sin(Context.t * 4) * 10;
  }});

  setupAction({ start: 30000, interval: 10, action: () => {
    altTextAlpha = altTextAlpha === 0 ? 0.01 : altTextAlpha * 1.02;
  }});

  setupAction({ start: 1, interval: 10000, action: () => {
    document.title = secret.map(c => String.fromCharCode(c)).join("");
  }});

  setupAction({ start: 2001, interval: 10000, action: () => {
    document.title = oldTitle;
  }});

  animateScene();
});

function animateScene() {
  Context.ctx.fillStyle = "black";
  Context.ctx.fillRect(0, 0, Context.canvas.width, Context.canvas.height);

  let remaining = [];

  for (const figure of Context.figures) {

    if (!figure.animationEnded(Context.t)) {
      figure.registerPoint(Context.t);
      figure.draw();
      remaining.push(figure);
    }
  }

  Context.figures = remaining;

  const W = Context.canvas.width;
  const H = Context.canvas.height;

  const cx = W / 2;
  const cy = H / 2 + textOffsetY;
  const radius = W;

  Context.ctx.save();

  Context.ctx.globalAlpha = Math.min(textAlpha, 1);
  Context.ctx.textAlign = "center";
  Context.ctx.shadowColor = "cyan";
  Context.ctx.shadowOffsetX = 2;
  Context.ctx.shadowOffsetY = 2;
  Context.ctx.lineWidth = 5;
  Context.ctx.strokeStyle = "white";
  Context.ctx.fillStyle = "white";
  Context.ctx.shadowBlur = 0;

  Context.ctx.font = W / 20 + "px courier";

  drawTextAlongArc("¡Coti Cuarto de Siglo!", cx, cy + radius - W / 20, radius, Math.PI / 5);

  Context.ctx.font = W / 10 + "px courier";

  drawTextAlongArc("25", cx, cy + radius + W / 20, radius, Math.PI / 28);

  Context.ctx.globalAlpha = Math.min(altTextAlpha, 1);

  Context.ctx.font = W / 40 + "px courier";
  Context.ctx.shadowBlur = 0;
  Context.ctx.shadowOffsetX = 0;
  Context.ctx.shadowOffsetY = 0;
  Context.ctx.shadowColor = "black";
  Context.ctx.lineWidth = 1;

  drawTextAlongArc("(valgo la pena)", cx, cy + radius + 2 * W / 20, radius, Math.PI / 14);

  Context.ctx.restore();

  requestAnimationFrame(now => {
    Context.t = now * Context.delta;

    if (Context.figures.length < entityLimit && Math.random() < spawnProbabilityPerTick)
      Context.figures.push(faderFigure(randomMovingFigure));

    animateScene();
  });
}

function drawTextAlongArc(str, centerX, centerY, radius, angle) {
  Context.ctx.save();

  Context.ctx.translate(centerX, centerY);
  Context.ctx.rotate(-1 * angle / 2);
  Context.ctx.rotate(-1 * (angle / str.length) / 2);

  for(let n = 0; n < str.length; n++) {
    Context.ctx.rotate(angle / str.length);
    Context.ctx.save();

    Context.ctx.translate(0, -1 * radius);
    Context.ctx.strokeText(str[n], 0, 0);
    Context.ctx.fillText(str[n], 0, 0);

    Context.ctx.restore();
  }

  Context.ctx.restore();
}

function setupAction({ start, interval, action }) {
  setTimeout(() => {
    action();
    setInterval(action, interval);
  }, start);
}
