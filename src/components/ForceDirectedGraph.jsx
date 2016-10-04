import * as d3 from 'd3'
import React, { Component } from 'react'
// import ReactFauxDOM from 'react-faux-dom'
import PropTypes from '../propTypes'

// These colors are also defined in GraphKey.jsx
const getColorFromDependencyType = {
  'unknown': '#6f777b',
  'policy_area': '#2E358B',
  'resource_sharing': '#D53880',
  'shared_location': '#df3034',
  'technical_integration': '#FFBF47',
  'data_access': '#28A197',
  'responsible_for': '#F47738'
}

const getColorFromNodeType = {
  'organisation': '#F47738',
  'programme': '#912B88',
  'service': '#2B8CC4'
}

export default class ForceDirectedGraph extends Component {
  static propTypes = {
    height: PropTypes.number,
    nodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired
    })).isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired
    })).isRequired,
    width: PropTypes.number
  }

  componentDidMount () {
    const {height, width} = this.props
    const data = {
      nodes: this.props.nodes.slice(),
      links: this.props.links.slice()
    }

    const svg = d3.select('#graph')
      .attr('height', height)
      .attr('width', width)

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
      .selectAll('path')
      .data(data.links)
      .enter().append('path')
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
        .attr('r', 5)
        .attr('fill', '#fff')
        .attr('stroke', d => getColorFromNodeType[d.type])
        .attr('stroke-width', '2.5px')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)

    const label = svg.append('g')
        .attr('class', 'labels')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
        .attr('data-node-id', d => d.id)
        .attr('filter', 'url(#background-white)')
        .text(d => d.id)

    simulation
      .nodes(data.nodes)
      .on('tick', ticked)

    simulation.force('link')
      .links(data.links)

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

    function getRelatedNodes (d) {
      const isRelatedLink = l => l.source.id === d.id || l.target.id === d.id
      const linkToRelatedNode = l => (l.source.id === d.id) ? l.target : l.source
      return data.links
        .filter(isRelatedLink)
        .map(linkToRelatedNode)
    }

    function mouseover (d) {
      getRelatedNodes(d)
        .concat([d]) // Add the initial node too.
        .forEach(d => d3.selectAll(`[data-node-id="${d.id}"]`).classed('selected', true))
    }

    function mouseout (d) {
      getRelatedNodes(d)
        .concat([d]) // Add the initial node too.
        .forEach(d => d3.selectAll(`[data-node-id="${d.id}"]`).classed('selected', false))
    }
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
