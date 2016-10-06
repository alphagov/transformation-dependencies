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
    hoveredNode: null,
    visibleLinkTypes: {
      'unknown': true,
      'policy_area': true,
      'resource_sharing': true,
      'shared_location': true,
      'technical_integration': true,
      'data_access': true,
      'responsible_for': true
    },
    services: []
  }

  constructor (props) {
    super(props)

    this.handleGoogleSheetsApiReady = this.handleGoogleSheetsApiReady.bind(this)
    this.loadSpreadsheet = this.loadSpreadsheet.bind(this)
    this.handleNodeClick = this.handleNodeClick.bind(this)
    this.startClick = this.startClick.bind(this)
    this.handleNodeMouseOver = this.handleNodeMouseOver.bind(this)
    this.handleNodeMouseOut = this.handleNodeMouseOut.bind(this)
    this.handleTypeClick = this.handleTypeClick.bind(this)
  }

  handleGoogleSheetsApiReady (gapi) {
    this.setState({ gapi })

    this.loadSpreadsheet()
  }

  loadSpreadsheet () {
    this.setState({ loading: true })

    const promiseDependencies = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'dependency!A2:F'
    }).then((response) => {
      const dependencies = response.result.values
        .filter(dep => dep[1] && dep[3] && dep[4])
      console.log('Fetched dependencies:', dependencies)
      this.setState({ dependencies })
    })

    const promiseProgrammes = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'programme!A2:T'
    }).then((response) => {
      const programmes = response.result.values
        .filter(prog => prog[2])
      console.log('Fetched programmes:', programmes)
      this.setState({ programmes })
    })

    const promiseOrganisations = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'organisation!A2:K'
    }).then((response) => {
      const organisations = response.result.values
        .filter(org => org[1])
      console.log('Fetched organisations:', organisations)
      this.setState({ organisations })
    })

    const promiseServices = this.state.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'service!A2:G'
    }).then((response) => {
      const services = response.result.values
        .filter(serv => serv[0])
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

  startClick (evt) {
    evt.preventDefault()
    this.setState({
      startClicked: true
    })
  }

  handleNodeMouseOver (node) {
    this.setState({
      hoveredNode: node
    })
  }

  handleNodeMouseOut (node) {
    this.setState({
      hoveredNode: null
    })
  }

  handleTypeClick (type) {
    this.setState(prevState => {
      let newType = {}
      newType[type] = !prevState.visibleLinkTypes[type]
      return {
        visibleLinkTypes: Object.assign(prevState.visibleLinkTypes, newType)
      }
    })
  }

  render () {
    const {loading, hoveredNode, selectedNode, startClicked, visibleLinkTypes} = this.state
    const links = this.getLinks()
    computeAdjacencyLists(links)
    const nodes = this.getNodes()
    return <div>
      {startClicked
        ? <GoogleSheetsApi
          onReady={this.handleGoogleSheetsApiReady}
        />
        : null
      }
      <div className='grid-row'>
        <div className='column-two-thirds'>
          <h1 className='heading-xlarge'>View government transformation</h1>
          <div className='graph-container'>
            {startClicked
              ? loading
                ? <p>Loading...</p>
                : <div>
                  <p>Click on a circle to find out more about it.</p>
                  <ForceDirectedGraph
                    height={480}
                    hoveredNode={hoveredNode}
                    links={links}
                    onNodeClick={this.handleNodeClick}
                    nodes={nodes}
                    selectedNode={selectedNode}
                    visibleLinkTypes={visibleLinkTypes}
                    width={630}
                  />
                  <GraphKey
                    onTypeClick={this.handleTypeClick}
                    visibleLinkTypes={visibleLinkTypes}
                  />
                </div>
              : <div>
                <p>This service shows you how transformation programmes in government are linked.</p>
                <p>To get access, you need to login with a <code>@digital.cabinet-office.gov.uk</code> Google account.</p>
                <a className='button button-start' href='#' role='button' onClick={this.startClick}>Start now</a>
              </div>
            }

          </div>
        </div>
        <div className='column-one-third' style={{paddingTop: '140px'}}>
          {startClicked
            ? loading
              ? null
              : <NodeMoreInfo
                node={selectedNode}
                allNodes={nodes}
                links={links}
                onNodeClick={this.handleNodeClick}
                onNodeMouseOver={this.handleNodeMouseOver}
                onNodeMouseOut={this.handleNodeMouseOut}
              />
            : null
          }
        </div>
      </div>
    </div>
  }
}
