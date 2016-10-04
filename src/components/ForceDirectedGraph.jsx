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

      svg.append('svg:defs')
        .append('svg:marker')
          .attr('id', `end-arrow-${type}`)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 6)
          .attr('markerWidth', 3)
          .attr('markerHeight', 3)
          .attr('orient', 'auto')
        .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', color)
    })

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg.append('g')
      .selectAll('path')
      .data(data.links)
      .enter().append('path')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)
        .attr('stroke', d => getColorFromDependencyType[d.dependencyType])
        .style('marker-end', d => `url(#end-arrow-${d.dependencyType})`)

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
        .attr('r', 5)
        .attr('stroke', '#fff')
        .attr('stroke-width', '1.5px')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))

    node.append('title')
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
          const sourcePadding = 7
          const targetPadding = 7
          const sourceX = d.source.x + (sourcePadding * normX)
          const sourceY = d.source.y + (sourcePadding * normY)
          const targetX = d.target.x - (targetPadding * normX)
          const targetY = d.target.y - (targetPadding * normY)
          return `M${sourceX},${sourceY}L${targetX},${targetY}`
        })

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
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

  render () {
    const {height, width} = this.props

    return <svg id='graph' height={height} width={width} />
  }
}
