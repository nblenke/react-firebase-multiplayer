import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  dataToJS,
  pathToJS,
} from 'react-redux-firebase'

class Ship extends Component {
  static propTypes = {
    ship: PropTypes.object,
  }

  state = {
    isSelected: false
  }

  handleClick = (ev) => {
    const {firebase, ship, id} = this.props

    this.setState({ isSelected: !this.state.isSelected })

    // if (this.state.isSelected) {
    //   firebase.set(`/ships/${id}/done`, !todo.done)
    // }
  }

  render(){
    const {firebase, ship, id} = this.props

    return (
      <div
        className={`ship${this.state.isSelected ? ' ship--selected' : ''}`}
        style={{
          left: `${ship.x}px`,
          top: `${ship.y}px`
        }}
        onClick={this.handleClick} />
    )
  }
}

export default compose(
  firebaseConnect([
    '/ships'
  ]),
  connect(
    ({ firebase }) => ({
      auth: pathToJS(firebase, 'auth'),
      ships: dataToJS(firebase, 'ships'),
    })
  )
)(Ship)
