import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  isLoaded,
  isEmpty,
  dataToJS,
  pathToJS,
} from 'react-redux-firebase'
import Ship from './Ship'
import Login from './Login'
import './App.css'
import { setShipIsMoving } from './utils'
import { BOARD_WIDTH, BOARD_HEIGHT, SHIP_WIDTH } from './const'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shipsPositioned: false,
    }
  }

  positionShips() {
    const { firebase, ships } = this.props

    if (!ships || !this.state || this.state.shipsPositioned) {
      return
    }

    this.setState({ shipsPositioned: true })

    Object.keys(ships).forEach((key) => {
      const { id } = ships[key]
      setShipIsMoving(firebase, id, true)

      setTimeout(() => {
        setShipIsMoving(firebase, id, false)
      }, 0)
    })
  }

  componentDidUpdate() {
    this.positionShips()
  }

  handleJoin = () => {
    const { auth, firebase } = this.props

    firebase.pushWithMeta('/ships', {
      isColliding: false,
      isMoving: false,
      isSelected: false,
      uid: auth.uid,
      x: 10,
      xDest: 10,
      y: 10,
      yDest: 10,
    }).then((ref) => {
      const id = ref.path.o[1]
      firebase.set(`/ships/${id}/id`, id)
    })
  }

  handleBoardClick = (ev) => {
    const {auth, firebase, ships} = this.props
    const selectedShipIds = []
    const board = document.querySelector('.board')
    const rect = board.getBoundingClientRect();
    const xDest = ev.clientX - rect.left - (SHIP_WIDTH / 2)
    const yDest = ev.clientY - rect.top - (SHIP_WIDTH / 2)

    Object.keys(ships).forEach((key) => {
      const {id, isSelected, uid} = ships[key]
      if (auth.uid !== uid) {
        return
      }
      isSelected && selectedShipIds.push({ id, xDest, yDest })
    })

    selectedShipIds.forEach(({ id, xDest, yDest }, index) => {
      firebase.update(`/ships/${id}/`, {
        isMoving: true,
        isSelected: false,
        xDest,
        yDest
      })
    })
  }

  render () {
    const { auth, ships } = this.props
    const shipsList = (!isLoaded(ships))
      ? 'Loading'
      : (isEmpty(ships))
        ? ''
        : Object.keys(ships).map((key) => (
          <Ship key={key} id={key} ship={ships[key]} />
        ))

    return (
      <div>
        <div>
          {isLoaded(auth) && !isEmpty(auth)? (
            <div>
              <button onClick={this.handleJoin}>
                Join
              </button>

              <div className="outer">
                <div
                  className="board"
                  style={{
                    width: BOARD_WIDTH,
                    height: BOARD_HEIGHT,
                  }}
                  onClick={this.handleBoardClick}
                >
                  {shipsList}
                </div>
              </div>

            </div>
          ) : null}
        </div>

        <Login />
      </div>
    )
  }
}

export default compose(
  firebaseConnect([
    '/auth',
    '/users',
    '/ships'
    // { type: 'once', path: '/todos' } // for loading once instead of binding
    // '/todos#populate=owner:displayNames' // for populating owner parameter from id into string loaded from /displayNames root
    // '/todos#populate=collaborators:users' // for populating owner parameter from id to user object loaded from /users root
    // { path: 'todos', populates: [{ child: 'collaborators', root: 'users' }] } // object notation of population
    // '/todos#populate=owner:users:displayName' // for populating owner parameter from id within to displayName string from user object within users root
  ]),
  connect(
    ({ firebase }) => ({
      auth: pathToJS(firebase, 'auth'),
      users: dataToJS(firebase, 'users'),
      ships: dataToJS(firebase, 'ships'),
    })
  )
)(App)
