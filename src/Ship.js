import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Animated } from 'react-web-animation';
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  dataToJS,
  pathToJS,
} from 'react-redux-firebase'
import classNames from 'classnames'
import { SHIP_COLLISION_BUFFER, SHIP_SPEED, SHIP_HEIGHT, SHIP_WIDTH } from './const'
import { collides, lineDistance, setShipIsMoving } from './utils'
import './Ship.css'

class Ship extends Component {
  static propTypes = {
    ship: PropTypes.object,
  }

  handleClick = (ev) => {
    const { auth, id, firebase, ship } = this.props

    if (auth.uid === ship.uid) {
      firebase.set(`/ships/${id}/isSelected`, !ship.isSelected)
    }
  }

  getPos(id, xDest, yDest) {
    const board = document.querySelector('.board')
    const { x, y } = this.props.ship

    return {
      start: {x, y},
      end: {
        x: xDest - board.offsetLeft,
        y: yDest - board.offsetTop,
      }
    }
  }

  getKeyFrames() {
    const { id, isMoving, xDest, yDest } = this.props.ship
    const shipEl = document.querySelector(`[data-id='${id}']`)

    if (shipEl && isMoving) {
      const { start, end } = this.getPos(id, xDest, yDest)

      return [
        { transform: `translate(${start.x}px, ${start.y}px)`},
        { transform: `translate(${end.x}px, ${end.y}px)`},
      ]
    }
  }

  setShipCollisions() {
    const { firebase, ships } = this.props
    const collisions = []

    Object.keys(ships).forEach((key) => {
      const {id} = ships[key]
      const ship = document.querySelector(`[data-id='${id}']`)
      const otherShips = document.querySelectorAll(`.ship:not([data-id='${id}'])`)

      otherShips.forEach((otherShip) => {
        collides(ship, otherShip, SHIP_COLLISION_BUFFER) &&
          collisions.push(otherShip.dataset.id)
      })

      firebase.update(`/ships/${id}/`, { isColliding: false })
    })

    collisions.forEach((id) => {
      firebase.update(`/ships/${id}/`, {
        isColliding: true,
      })
    })
  }

  getTiming(speed) {
    const { firebase, ship } = this.props
    const { id, isMoving, xDest, yDest } = ship
    const shipEl = document.querySelector(`[data-id='${id}']`)

    if (shipEl && isMoving) {
      const { start, end } = this.getPos(id, xDest, yDest)
      const distance = lineDistance({x: start.x, y: start.y}, {x: end.x, y: end.y})
      const duration = distance * 4

      setTimeout(() => {
        firebase.update(`/ships/${id}/`, {
          x: xDest,
          y: yDest
        })
        setShipIsMoving(firebase, id, false)
        this.setShipCollisions()
      }, duration)

      return {
        duration,
        fill: 'forwards',
      }
    } else {
      return {
        speed,
        fill: 'forwards',
      }
    }
  }

  render() {
    const {auth, id, ship, users} = this.props
    const {isColliding, isSelected, uid} = ship
    const isUser = auth.uid === uid

    return (
      <Animated.div
        data-id={id}
        style={{
          width: SHIP_WIDTH,
          height: SHIP_HEIGHT,
        }}
        className={classNames(
          'ship',
          {
            'ship--user': isUser,
            'ship--colliding': isColliding,
            'ship--selected': isSelected,
          }
        )}
        keyframes={this.getKeyFrames()}
        timing={this.getTiming(SHIP_SPEED)}
        onClick={this.handleClick}>

        {users &&
          <p
            className="ship__owner"
            style={{
              margin: `${SHIP_WIDTH*1.2}px 0 0 -50%`,
            }}
          >
            {users[uid].email}
          </p>
        }
      </Animated.div>
    )
  }
}

export default compose(
  firebaseConnect([
    '/auth',
    '/users',
    '/ships'
  ]),
  connect(
    ({ firebase }) => ({
      auth: pathToJS(firebase, 'auth'),
      users: dataToJS(firebase, 'users'),
      ships: dataToJS(firebase, 'ships'),
    })
  )
)(Ship)
