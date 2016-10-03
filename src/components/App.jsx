import React, { Component } from 'react'
import GoogleSheetsApi from './GoogleSheetsApi'

var SPREADSHEET_ID = process.env.SPREADSHEET_ID

export default class App extends Component {
  state = {
    gapi: false
  }

  constructor (props) {
    super(props)

    this.handleGoogleSheetsApiReady = this.handleGoogleSheetsApiReady.bind(this)
    this.loadSpreadsheet = this.loadSpreadsheet.bind(this)
  }

  handleGoogleSheetsApiReady (gapi) {
    this.setState({ gapi })

    this.loadSpreadsheet()
  }

  loadSpreadsheet () {
    this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'dependency!A1:E'
    }).then((response) => {
      console.log('response', response)
    })
  }

  render () {
    return <div>
      <GoogleSheetsApi
        onReady={this.handleGoogleSheetsApiReady}
      />
      <h1>Hello, world!</h1>
    </div>
  }
}
