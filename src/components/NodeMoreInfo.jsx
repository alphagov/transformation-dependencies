import React, { Component } from 'react'
import PropTypes from '../propTypes'
import {getRelatedNodes} from '../utils'

export default class NodeMoreInfo extends Component {
  static propTypes = {
    links: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired
    })).isRequired,
    node: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }

  render () {
    const {links, node} = this.props
    const relatedNodes = (node) ? getRelatedNodes(links, node) : []
    return <div>
      <p>Click on a node to find out more about it.</p>
      <h2 className='heading-medium'>
        Selected node: {(node) ? node.id : 'none' }
      </h2>
      {(node)
        ? <div>
          <p>Neighbouring nodes:</p>
          <ul>
            {relatedNodes.map((n, idx) =>
              <li key={idx} style={{ listStyleType: 'disc' }}>{ (typeof n === 'object') ? n.id : n }</li>
            )}
          </ul>
        </div>
        : null
      }
    </div>
  }
}
