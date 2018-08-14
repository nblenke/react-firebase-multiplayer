import { TICK_DELAY } from './const'

export const collides = (a, b) => {
  const rect1 = a.getBoundingClientRect()
  const rect2 = b.getBoundingClientRect()

  return !(rect1.left > rect2.right || rect1.right < rect2.left ||
      rect1.top > rect2.bottom || rect1.bottom < rect2.top)
}

export const matrixToArray = (matrix) => matrix.substr(7, matrix.length - 8).split(', ')

const requestAnimFrame = (() =>
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  ((callback) => {
      window.setTimeout(callback, 1000 / 60)
  })
)()

export const tick = callback => {
  const tick = () => {
    setTimeout(function() {
      requestAnimFrame(tick);
      callback()
    }, TICK_DELAY);
  }
  tick()
}

export const lineDistance =  (point1, point2) => {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}

export const shipRect = id => document.querySelector(`[data-id='${id}']`).getBoundingClientRect()