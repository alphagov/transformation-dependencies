import React, { Component } from 'react'
import GoogleSheetsApi from './GoogleSheetsApi'
import ForceDirectedGraph from './ForceDirectedGraph'
import GraphKey from './GraphKey'
import NodeMoreInfo from './NodeMoreInfo'

var SPREADSHEET_ID = process.env.SPREADSHEET_ID

let outboundList = {}
let inboundList = {}

const computeAdjacencyLists = (links) => {
  outboundList = {}
  inboundList = {}
  links.forEach(link => {
    const ls = link.source
    const lt = link.target
    outboundList[ls] = outboundList[ls] ? outboundList[ls].concat([lt]) : [lt]
    inboundList[lt] = inboundList[lt] ? inboundList[lt].concat([ls]) : [ls]
  })
}

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
    this.startClick = this.startClick.bind(this)
  }

  handleGoogleSheetsApiReady (gapi) {
    this.setState({ gapi })

    this.loadSpreadsheet()
  }

  loadSpreadsheet () {
    this.setState({ loading: true })

    const promiseDependencies = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'dependency!A2:F199'
    }).then((response) => {
      const dependencies = response.result.values
      console.log('Fetched dependencies:', dependencies)
      this.setState({ dependencies })
    })

    const promiseProgrammes = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'programme!A2:T116'
    }).then((response) => {
      const programmes = response.result.values
      console.log('Fetched programmes:', programmes)
      this.setState({ programmes })
    })

    const promiseOrganisations = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'organisation!A2:K998'
    }).then((response) => {
      const organisations = response.result.values
      console.log('Fetched organisations:', organisations)
      this.setState({ organisations })
    })

    const promiseServices = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'service!A2:G101'
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
    const isConnectedNode = n => n.outboundLinks + n.inboundLinks > 0
    const nodes = []
      .concat(organisations.map(org => ({
        id: org[1],
        type: 'organisation',
        outboundLinks: (outboundList[org[1]] || []).length,
        inboundLinks: (inboundList[org[1]] || []).length,
        pagerankScore: Number(org[10] || 34)
      })))
      .concat(programmes.map(prog => ({
        id: prog[2],
        type: 'programme',
        outboundLinks: (outboundList[prog[2]] || []).length,
        inboundLinks: (inboundList[prog[2]] || []).length,
        pagerankScore: Number(prog[19] || 34)
      })))
      .concat(services.map(serv => ({
        id: serv[0],
        type: 'service',
        outboundLinks: (outboundList[serv[0]] || []).length,
        inboundLinks: (inboundList[serv[0]] || []).length,
        pagerankScore: Number(serv[6] || 34)
      })))
      .filter(isConnectedNode)
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

  startClick(){
    this.setState({
      startClicked: true
    })
  }

  render () {
    const {loading, selectedNode} = this.state
    const links = this.getLinks()
    computeAdjacencyLists(links)
    const nodes = this.getNodes()
    return <div>
      {
        this.state.startClicked ?
          <GoogleSheetsApi
            onReady={this.handleGoogleSheetsApiReady}
          />
        : null
      }
      <div className='grid-row'>
        <div className='column-two-thirds'>
          <h1 className='heading-xlarge'>View government transformation</h1>
          <div className='graph-container'>
            {this.state.startClicked ?
              (loading) ?
                <p>Loading...</p>
                :
                <div>
                  <ForceDirectedGraph
                    height={480}
                    links={links}
                    onNodeClick={this.handleNodeClick}
                    nodes={nodes}
                    width={630}
                  />
                  <GraphKey />
                </div>
              :
              <div>
                <p>This service shows you how transformation programmes in government are linked.</p>
                <p>To get access, you need to login with a <code>@digital.cabinet-office.gov.uk</code> Google account.</p>
                <a className="button button-start" href="#" role="button" onClick={this.startClick}>Start now</a>
              </div>
            }

          </div>
        </div>
        <div className='column-one-third' style={{paddingTop: '140px'}}>
          {(loading)
            ? null
            : <NodeMoreInfo
              node={selectedNode}
              allNodes={nodes}
              links={links}
            />
          }
        </div>
      </div>
    </div>
  }
}
