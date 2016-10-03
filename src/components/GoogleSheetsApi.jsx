import React, { Component } from 'react'
import PropTypes from '../propTypes'
let gapi = window.gapi

const POLL_INTERVAL = 50
const CLIENT_ID = process.env.CLIENT_ID
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const DISCOVERY_URL = 'https://sheets.googleapis.com/$discovery/rest?version=v4'

export default class GoogleSheetsApi extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired
  }

  state = {
    googleAuthError: false
  }

  constructor (props) {
    super(props)

    this._checkGoogle = true
    this.pollGoogle()

    this.loadSheetsApi = this.loadSheetsApi.bind(this)
  }

  componentWillUnmount () {
    this._checkGoogle = false
  }

  pollGoogle () {
    gapi = window.gapi
    const isGapiReady = gapi && gapi.auth && gapi.auth.authorize
    if (isGapiReady) {
      this.loadSheetsApi()
    } else if (this._checkGoogle) {
      setTimeout(() => this.pollGoogle(), POLL_INTERVAL)
    }
  }

  loadSheetsApi () {
    this.setState({ googleAuthError: false })
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPES,
      'immediate': true
    }, (authResult) => {
      if (authResult.error) {
        this.setState({ googleAuthError: authResult })
        return
      }

      gapi.client.load(DISCOVERY_URL).then(() => {
        this.props.onReady(gapi)
      })
    })
  }

  render () {
    const {googleAuthError} = this.state

    return <div>
      {(googleAuthError)
        ? <div>
          <p>
            Google Auth error: {googleAuthError.error} {googleAuthError.error_subtype}<br />
            Authorize access to Google Sheets API <button onClick={this.loadSheetsApi}>Authorize</button>
          </p>
        </div>
        : null
      }
    </div>
  }
}
