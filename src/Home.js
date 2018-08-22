import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  isLoaded,
  isEmpty,
  dataToJS,
  pathToJS,
} from 'react-redux-firebase'
import { Link } from 'react-router-dom';

const Home = (props) => {
  const { auth, firebase, games } = props
  const handleMatchCreateClick = () => {
    let gameId

    firebase.pushWithMeta('/games')
    .then((ref) => {
      gameId = ref.path.o[1]

      firebase.pushWithMeta(`/games/${gameId}/ships`, {
        isColliding: false,
        isMoving: false,
        isSelected: false,
        uid: auth.uid,
        x: 10,
        xDest: 10,
        y: 10,
        yDest: 10,
      })
      .then((ref) => {
        const shipId = ref.path.o[3]
        firebase.set(`/games/${gameId}/ships/${shipId}/id`, shipId)
      })
    })
  }

  return (
    <div>
      <h1>Galactic Endeavor</h1>

      {isLoaded(auth) && !isEmpty(auth)? (
        <div>
          <p>Welcome!</p>

          <button onClick={() => handleMatchCreateClick()}>
            Create Game
          </button>

          <p>Current Games:</p>
          <div className="match-list">
            {games && Object.keys(games).map((key) =>
              <div key={key}>
                <Link to={`game/${key}`}>{key}</Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>Not Signed In. <Link to="/login">Login</Link></p>
        </div>
      )}
    </div>
  )
}

export default compose(
  firebaseConnect([
    '/auth',
    '/games',
  ]),
  connect(
    ({ firebase }) => ({
      auth: pathToJS(firebase, 'auth'),
      games: dataToJS(firebase, 'games'),
    })
  )
)(Home)
