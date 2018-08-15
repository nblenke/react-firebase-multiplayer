import { SHIP_COLLISION_BUFFER, TICK_DELAY } from './const'

export const collides = (a, b, buff = 0) => {
  const rect1 = a.getBoundingClientRect()
  const rect2 = b.getBoundingClientRect()

  return !(
    (rect1.left - buff) > (rect2.right + buff) ||
    (rect1.right + buff) < (rect2.left - buff) ||
    (rect1.top - buff) > (rect2.bottom + buff) ||
    (rect1.bottom + buff) < (rect2.top - buff)
  )
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

export const setShipIsMoving = (firebase, id, isMoving) => {
  firebase.update(`/ships/${id}/`, {isMoving})
}

export const setShipCollisions = (props) => {
  const {firebase, ships} = props
  const collisionIds = []

  Object.keys(ships).forEach((key) => {
    const {id} = ships[key]
    const ship = document.querySelector(`[data-id='${id}']`)
    const otherShips = document.querySelectorAll(`.ship:not([data-id='${id}'])`)

    otherShips.forEach((otherShip) => {
      collides(ship, otherShip, SHIP_COLLISION_BUFFER) && collisionIds.push(otherShip.dataset.id)
    })

    firebase.update(`/ships/${id}/`, { isColliding: false })
  })

  collisionIds.forEach((collisionId) => {
    firebase.update(`/ships/${collisionId}/`, { isColliding: true })
  })
}
