import React, { Component } from 'react'
import GoogleSheetsApi from './GoogleSheetsApi'
import ForceDirectedGraph from './ForceDirectedGraph'

var SPREADSHEET_ID = process.env.SPREADSHEET_ID

export default class App extends Component {
  state = {
    gapi: false,
    links: [],
    organisations: [],
    programmes: [],
    services: []
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
      range: 'dependency!A2:F176'
    }).then((response) => {
      const dependencies = response.result.values
      console.log('dependency', dependencies)
      this.setState({
        links: dependencies.map(dep => ({ source: dep[1], target: dep[3] }))
      })
    })

    this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'programme!A2:Q116'
    }).then((response) => {
      const programmes = response.result.values
      console.log('programmes', programmes)
      this.setState({
        programmes: programmes.map(prog => ({ id: prog[2] }))
      })
    })

    this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'organisation!A2:H998'
    }).then((response) => {
      const organisations = response.result.values
      console.log('organisations', organisations)
      this.setState({
        organisations: organisations.map(org => ({ id: org[1] }))
      })
    })

    this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'service!A2:D101'
    }).then((response) => {
      const services = response.result.values
      console.log('services', services)
      this.setState({
        services: services.map(org => ({ id: org[0] }))
      })
    })
  }

  render () {
    const {organisations, programmes, links, services} = this.state
    const loading = !organisations.length || !links.length || !programmes.length || !services.length
    return <div>
      <GoogleSheetsApi
        onReady={this.handleGoogleSheetsApiReady}
      />
      {(loading)
        ? <p>Loading...</p>
        : <ForceDirectedGraph
          width={960}
          height={600}
          nodes={programmes.concat(organisations).concat(services)}
          links={links}
        />
      }
    </div>
  }
}
