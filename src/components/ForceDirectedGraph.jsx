import * as d3 from 'd3'
import React, { Component } from 'react'
// import ReactFauxDOM from 'react-faux-dom'
import PropTypes from '../propTypes'
import {getRelatedNodes, getColorFromDependencyType} from '../utils'

// These colors are also defined in Application.scss
const getColorFromNodeType = {
  'organisation': '#F47738',
  'programme': '#912B88',
  'service': '#2B8CC4'
}

let data = {
  nodes: [],
  links: []
}

export default class ForceDirectedGraph extends Component {
  static propTypes = {
    height: PropTypes.number,
    hoveredNode: PropTypes.shape({
      id: PropTypes.string.isRequired
    }),
    links: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired
    })).isRequired,
    onNodeClick: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired
    })).isRequired,
    selectedNode: PropTypes.shape({
      id: PropTypes.string.isRequired
    }),
    visibleLinkTypes: PropTypes.shape({
      'unknown': PropTypes.bool.isRequired,
      'policy_area': PropTypes.bool.isRequired,
      'resource_sharing': PropTypes.bool.isRequired,
      'shared_location': PropTypes.bool.isRequired,
      'technical_integration': PropTypes.bool.isRequired,
      'data_access': PropTypes.bool.isRequired,
      'responsible_for': PropTypes.bool.isRequired
    }).isRequired,
    width: PropTypes.number
  }

  state = {
    previousNode: null,
    previousNodes: []
  }

  constructor (props) {
    super(props)

    this.handleNodeClick = this.handleNodeClick.bind(this)
    this.handleLinkUpdate = this.handleLinkUpdate.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
    this.onMouseout = this.onMouseout.bind(this)
  }

  componentDidUpdate (prevState) {
    const prevHoveredNode = prevState.hoveredNode
    const newHoveredNode = this.props.hoveredNode
    if (prevHoveredNode) {
      d3.select(`text[data-node-id="${prevHoveredNode.id}"]`).classed('selected', false)
    }
    if (newHoveredNode) {
      d3.select(`text[data-node-id="${newHoveredNode.id}"]`).classed('selected', true)
    }

    const prevSelectedNode = prevState.selectedNode
    const newSelectedNode = this.props.selectedNode
    if (prevSelectedNode !== newSelectedNode) {
      this.handleNodeClick(newSelectedNode)
    }

    const visibleLinkTypes = this.props.visibleLinkTypes
    Object.keys(visibleLinkTypes).forEach(lt => {
      this.handleLinkUpdate(lt, !visibleLinkTypes[lt])
    })
  }

  componentDidMount () {
    const {height, width} = this.props
    data = {
      nodes: this.props.nodes.slice(),
      links: this.props.links.slice()
    }

    const svg = d3.select('#graph')
      .attr('height', height)
      .attr('width', width)
      .call(d3.zoom()
        .on('zoom', () => {
          svg.attr('transform', d3.event.transform)
        })
      )
      .append('g')

    // Define arrow markers for graph links.
    Object.keys(getColorFromDependencyType).forEach(type => {
      const color = getColorFromDependencyType[type]

      svg.append('defs')
        .append('marker')
          .attr('id', `end-arrow-${type}`)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 6)
          .attr('markerWidth', 3)
          .attr('markerHeight', 3)
          .attr('orient', 'auto')
        .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', color)
    })

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg.append('g')
        .attr('class', 'links')
      .selectAll('path')
      .data(data.links)
      .enter().append('path')
        .attr('data-type', d => d.type)
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 2.5)
        .attr('stroke', d => getColorFromDependencyType[d.type])
        .style('marker-end', d => `url(#end-arrow-${d.type})`)

    const node = svg.append('g')
        .attr('class', 'nodes')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
        .attr('data-node-id', d => d.id)
        .attr('r', d => d.outboundLinks + 5)
        .attr('fill', '#fff')
        .attr('stroke', d => getColorFromNodeType[d.type])
        .attr('stroke-width', '2.5px')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', (d) => {
          this.props.onNodeClick(d)
        })
        .on('mouseover', this.onMouseover)
        .on('mouseout', this.onMouseout)

    const label = svg.append('g')
        .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
        .attr('data-node-id', d => d.id)
        .attr('filter', 'url(#background-white)')
        .text(d => d.id)

    try {
      simulation
        .nodes(data.nodes)
        .on('tick', ticked)

      simulation.force('link')
        .links(data.links)
    } catch (e) {
      window.alert('There was a problem rendering the graph: one of the items in the `dependencies` sheet is linking to an unrecognised organisation/programme/service.')
    }

    function ticked () {
      link
        .attr('d', d => {
          const deltaX = d.target.x - d.source.x
          const deltaY = d.target.y - d.source.y
          const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          const normX = deltaX / dist
          const normY = deltaY / dist
          const sourcePadding = 5 // distance from end of line to center of node
          const targetPadding = 9 // distance from end of arrowhead to center of node
          const sourceX = d.source.x + (sourcePadding * normX)
          const sourceY = d.source.y + (sourcePadding * normY)
          const targetX = d.target.x - (targetPadding * normX)
          const targetY = d.target.y - (targetPadding * normY)
          return `M${sourceX},${sourceY}L${targetX},${targetY}`
        })

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    }

    function dragstarted (d) {
      if (!d3.event.active) { simulation.alphaTarget(0.3).restart() }
      d.fx = d.x
      d.fy = d.y
    }

    function dragged (d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended (d) {
      if (!d3.event.active) { simulation.alphaTarget(0) }
      d.fx = null
      d.fy = null
    }
  }

  onMouseover (d) {
    d3.select(`text[data-node-id="${d.id}"]`).classed('selected', true)
  }

  onMouseout (d) {
    let {previousNode} = this.state
    const isClicked = previousNode === d
    if (!isClicked) {
      d3.select(`text[data-node-id="${d.id}"]`).classed('selected', false)
    }
  }

  handleNodeClick (d) {
    let {previousNodes} = this.state
    previousNodes.forEach(node => d3.selectAll(`[data-node-id="${node.id}"]`).classed('selected', false))
    if (d) {
      const nodes = getRelatedNodes(data.links, d).concat([d])
      d3.select(`text[data-node-id="${d.id}"]`).classed('selected', true)
      nodes.forEach(node => d3.selectAll(`circle[data-node-id="${node.id}"]`).classed('selected', true))
      this.setState({
        previousNodes: nodes,
        previousNode: d
      })
    } else {
      this.setState({
        previousNodes: [],
        previousNode: null
      })
    }
  }

  handleLinkUpdate (type, visibility) {
    d3.selectAll(`path[data-type="${type}"]`).classed('hidden', visibility)
  }

  render () {
    const {height, width} = this.props

    return <svg
      id='graph'
      className='graph'
      height={height}
      width={width}
    >
      <defs>
        <filter x='0' y='0' width='1' height='1' id='background-white'>
          <feFlood floodColor='white' />
          <feComposite in='SourceGraphic' />
        </filter>
      </defs>
    </svg>
  }
}
