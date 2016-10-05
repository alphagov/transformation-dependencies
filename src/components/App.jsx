import React, { Component } from 'react'
import GoogleSheetsApi from './GoogleSheetsApi'
import ForceDirectedGraph from './ForceDirectedGraph'
import GraphKey from './GraphKey'
import NodeMoreInfo from './NodeMoreInfo'

var SPREADSHEET_ID = process.env.SPREADSHEET_ID

export default class App extends Component {
  state = {
    gapi: false,
    dependencies: [],
    loading: true,
    organisations: [],
    programmes: [],
    selectedNode: null,
    services: []
  }

  constructor (props) {
    super(props)

    this.handleGoogleSheetsApiReady = this.handleGoogleSheetsApiReady.bind(this)
    this.loadSpreadsheet = this.loadSpreadsheet.bind(this)
    this.handleNodeClick = this.handleNodeClick.bind(this)
  }

  handleGoogleSheetsApiReady (gapi) {
    this.setState({ gapi })

    this.loadSpreadsheet()
  }

  loadSpreadsheet () {
    this.setState({ loading: true })

    const promiseDependencies = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'dependency!A2:F176'
    }).then((response) => {
      const dependencies = response.result.values
      console.log('Fetched dependencies:', dependencies)
      this.setState({ dependencies })
    })

    const promiseProgrammes = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'programme!A2:Q116'
    }).then((response) => {
      const programmes = response.result.values
      console.log('Fetched programmes:', programmes)
      this.setState({ programmes })
    })

    const promiseOrganisations = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'organisation!A2:H998'
    }).then((response) => {
      const organisations = response.result.values
      console.log('Fetched organisations:', organisations)
      this.setState({ organisations })
    })

    const promiseServices = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'service!A2:D101'
    }).then((response) => {
      const services = response.result.values
      console.log('Fetched services:', services)
      this.setState({ services })
    })

    Promise.all([
      promiseDependencies,
      promiseProgrammes,
      promiseOrganisations,
      promiseServices
    ]).then(() => {
      this.setState({ loading: false })
    })
  }

  getNodes () {
    const {organisations, programmes, services} = this.state
    const nodes = []
      .concat(organisations.map(org => ({ id: org[1], type: 'organisation' })))
      .concat(programmes.map(prog => ({ id: prog[2], type: 'programme' })))
      .concat(services.map(serv => ({ id: serv[0], type: 'service' })))
    return nodes
  }

  getLinks () {
    const {dependencies} = this.state
    const links = dependencies.map(dep => ({
      source: dep[1],
      target: dep[3],
      type: dep[4]
    }))
    return links
  }

  handleNodeClick (node) {
    if (this.state.selectedNode === node) {
      this.setState({
        selectedNode: null
      })
    } else {
      this.setState({
        selectedNode: node
      })
    }
  }

  render () {
    const {loading, selectedNode} = this.state
    const links = this.getLinks()
    const nodes = this.getNodes()
    return <div>
      <GoogleSheetsApi
        onReady={this.handleGoogleSheetsApiReady}
      />
      <div className='grid-row'>
        <div className='column-two-thirds'>
          <h1 className='heading-xlarge'>Transformation Dependency Map</h1>
          <div className='graph-container'>
            {(loading)
              ? <div style={{
                border: '1px solid #BFC1C3',
                height: '480px',
                padding: '0 5px',
                width: '630px'
              }}><p>Loading...</p></div>
              : <ForceDirectedGraph
                height={480}
                links={links}
                onNodeClick={this.handleNodeClick}
                nodes={nodes}
                width={630}
              />
            }
            <GraphKey />
          </div>
        </div>
        <div className='column-one-third' style={{paddingTop: '190px'}}>
          {(loading)
            ? null
            : <NodeMoreInfo
              node={selectedNode}
              links={links}
            />
          }
        </div>
      </div>
    </div>
  }
}
