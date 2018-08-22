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
import { setShipCollisions, setShipIsMoving, tick } from './utils'

import { BOARD_WIDTH, BOARD_HEIGHT, SHIP_WIDTH } from './const'

class Game extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shipsPositioned: false,
    }
  }

  positionShips() {
    const { firebase, games, match } = this.props

    if (!games || !this.state || this.state.shipsPositioned) {
      return
    }

    const gameId = match.params[0]
    const { ships } = games[gameId]
    console.log('Game.positionShips', ships)

    this.setState({ shipsPositioned: true })

    Object.keys(ships).forEach((key) => {
      const { id } = ships[key]
      setShipIsMoving({ firebase, gameId, id, isMoving: true })

      setTimeout(() => {
        setShipIsMoving({ firebase, gameId, id, isMoving: false })
      }, 0)
    })
  }

  componentDidUpdate() {
    this.positionShips()
  }

  componentDidMount() {
    console.log('Game.componentDidMount')
    this.setState({ shipsPositioned: false })
    // tick(() => {
    //   setShipCollisions(this.props)
    // })
  }

  // componentWillUnmount() {
  //   this.setState({ shipsPositioned: false })
  // }

  handleJoinClick = () => {
    const { auth, firebase, match } = this.props
    const gameId = match.params[0]

    firebase.pushWithMeta(`/games/${gameId}/ships`, {
      isColliding: false,
      isMoving: false,
      isSelected: false,
      uid: auth.uid,
      x: 10,
      xDest: 10,
      y: 10,
      yDest: 10,
    }).then((ref) => {
      const shipId = ref.path.o[3]
      firebase.set(`/games/${gameId}/ships/${shipId}/id`, shipId)
    })
  }

  handleBoardClick = (ev) => {
    const {auth, firebase, games, match} = this.props
    const gameId = match.params[0]
    const { ships } = games[gameId]
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
      firebase.update(`/games/${gameId}/ships/${id}/`, {
        isMoving: true,
        isSelected: false,
        xDest,
        yDest
      })
    })
  }

  render () {
    const { auth, match, games } = this.props

    if (!games) {
      return false
    }

    const gameId = match.params[0]
    const { ships } = games[gameId]

    const shipsList = (!isLoaded(ships))
      ? 'Loading'
      : (isEmpty(ships))
        ? ''
        : Object.keys(ships).map((key) => (
          <Ship
            gameId={gameId}
            key={key}
            id={key}
            ship={ships[key]}
          />
        ))

    return (
      <div>
        {isLoaded(auth) && !isEmpty(auth)? (
          <div>
            <button onClick={this.handleJoinClick}>
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
        ) : 'Not Signed In'}
      </div>
    )
  }
}

export default compose(
  firebaseConnect([
    '/auth',
    '/users',
    '/games'
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
      games: dataToJS(firebase, 'games'),
    })
  )
)(Game)
