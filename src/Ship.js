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
import { SHIP_SPEED } from './const'
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

  getKeyFrames() {
    const { ship } = this.props
    const { id, isMoving, xDest, yDest } = ship
    const shipEl = document.querySelector(`[data-id='${id}']`)

    if (shipEl && isMoving) {
      const rect = shipEl.getBoundingClientRect()

      return [
        { transform: `translate(${rect.x}px, ${rect.y}px)`},
        { transform: `translate(${xDest}px, ${yDest}px)`},
      ]
    }
  }

  getTiming(duration) {
    return {
      duration,
      fill: 'forwards',
    }
  }

  render(){
    const {auth, id, ship, users} = this.props
    const isUser = auth.uid === ship.uid

    return (
      <Animated.div
        data-id={id}
        className={`ship${ship.isSelected ? ' ship--selected': ''}${ship.isColliding ? ' ship--colliding': ''}${isUser ? ' ship--user': ''}`}
        keyframes={this.getKeyFrames()}
        timing={this.getTiming(SHIP_SPEED)}
        onClick={this.handleClick}>

        {users && <h6 className="ship__owner">{users[ship.uid].email}</h6>}
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
