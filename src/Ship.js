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
import { SHIP_SPEED, SHIP_WIDTH } from './const'
import { lineDistance, setShipIsMoving, setShipCollisions } from './utils'
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
    const boardEl = document.querySelector('.board')
    const shipEl = document.querySelector(`[data-id='${id}']`)
    const rect = shipEl.getBoundingClientRect()
    const x = Math.round(rect.x) - boardEl.offsetLeft
    const y = Math.round(rect.y) - boardEl.offsetTop

    return {
      start: {x, y},
      end: {
        x: xDest - boardEl.offsetLeft,
        y: yDest - boardEl.offsetTop,
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

  getTiming(speed) {
    const { id, isMoving, xDest, yDest } = this.props.ship
    const shipEl = document.querySelector(`[data-id='${id}']`)

    if (shipEl && isMoving) {
      const { start, end } = this.getPos(id, xDest, yDest)
      const distance = lineDistance({x: start.x, y: start.y}, {x: end.x, y: end.y})
      const duration = distance * 4

      setTimeout(() => {
        setShipIsMoving(this.props.firebase, id, false)
        setShipCollisions(this.props)
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
          height: SHIP_WIDTH,
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
