import React, { Component } from 'react'
import PropTypes from '../propTypes'
import {getRelatedLinks, groupRelatedLinks} from '../utils'

class PrettyNodeList extends Component {
  static propTypes = {
    allNodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['organisation', 'programme', 'service']).isRequired
    })).isRequired,
    nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
    onNodeClick: PropTypes.func.isRequired,
    onNodeMouseOver: PropTypes.func.isRequired,
    onNodeMouseOut: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.onItemClick = this.onItemClick.bind(this)
    this.onItemMouseOver = this.onItemMouseOver.bind(this)
    this.onItemMouseOut = this.onItemMouseOut.bind(this)
  }

  onItemClick (node) {
    this.props.onNodeClick(node)
  }

  onItemMouseOver (node) {
    this.props.onNodeMouseOver(node)
  }

  onItemMouseOut (node) {
    this.props.onNodeMouseOut(node)
  }

  render () {
    const {allNodes, nodes} = this.props

    return <ul style={{marginBottom: '1em'}}>
      {nodes.map((nStr, idx) => {
        const node = allNodes.filter(n => n.id === nStr)[0]
        return <li
          className={`dependency dependency--${node.type}`}
          key={idx}
          onClick={() => this.onItemClick(node)}
          onMouseOver={() => this.onItemMouseOver(node)}
          onMouseOut={() => this.onItemMouseOut(node)}
        >{node.id}</li>
      })}
    </ul>
  }
}

class Relationship extends Component {
  static propTypes = {
    allNodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['organisation', 'programme', 'service']).isRequired
    })).isRequired,
    nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string.isRequired,
    onNodeClick: PropTypes.func.isRequired,
    onNodeMouseOver: PropTypes.func.isRequired,
    onNodeMouseOut: PropTypes.func.isRequired
  }

  render () {
    const {allNodes, nodes, type} = this.props
    let Phrase = (() => {
      switch (type) {
        case 'source_unknown':
          return () => <span>has an <span className='colored-underline colored-underline--unknown'>unknown</span> link to</span>
        case 'target_unknown':
          return () => <span>has an <span className='colored-underline colored-underline--unknown'>unknown</span> link from</span>
        case 'source_policy_area':
          return () => <span>relies on a <span className='colored-underline colored-underline--policy-area'>policy area</span> set by</span>
        case 'target_policy_area':
          return () => <span>sets the <span className='colored-underline colored-underline--policy-area'>policy area</span> for</span>
        case 'source_resource_sharing':
          return () => <span>gets <span className='colored-underline colored-underline--resource-sharing'>shared resources</span> from</span>
        case 'target_resource_sharing':
          return () => <span><span className='colored-underline colored-underline--resource-sharing'>shares resources</span> to</span>
        case 'source_shared_location':
          return () => <span><span className='colored-underline colored-underline--shared-location'>shares a location</span> from</span>
        case 'target_shared_location':
          return () => <span><span className='colored-underline colored-underline--shared-location'>shares a location</span> to</span>
        case 'source_technical_integration':
          return () => <span>receives <span className='colored-underline colored-underline--technical-integration'>technical integration</span> from</span>
        case 'target_technical_integration':
          return () => <span>offers <span className='colored-underline colored-underline--technical-integration'>technical integration</span> to</span>
        case 'source_data_access':
          return () => <span><span className='colored-underline colored-underline--data-access'>accesses data</span> from</span>
        case 'target_data_access':
          return () => <span>offers <span className='colored-underline colored-underline--data-access'>data access</span> to</span>
        case 'source_responsible_for':
          return () => <span>is <span className='colored-underline colored-underline--responsible-for'>responsible for</span></span>
        case 'target_responsible_for':
          return () => <span>is <span className='colored-underline colored-underline--responsible-for'>dependent on</span></span>
      }
    })()

    return <div>
      <Phrase />
      <PrettyNodeList
        allNodes={allNodes}
        nodes={nodes}
        onNodeClick={this.props.onNodeClick}
        onNodeMouseOver={this.props.onNodeMouseOver}
        onNodeMouseOut={this.props.onNodeMouseOut}
      />
    </div>
  }
}

export default class NodeMoreInfo extends Component {
  static propTypes = {
    allNodes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['organisation', 'programme', 'service']).isRequired
    })).isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })).isRequired,
    node: PropTypes.shape({
      id: PropTypes.string.isRequired
    }),
    onNodeClick: PropTypes.func.isRequired,
    onNodeMouseOver: PropTypes.func.isRequired,
    onNodeMouseOut: PropTypes.func.isRequired,
    selectedNode: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }

  render () {
    const {allNodes, links, node} = this.props
    const relatedLinks = (node) ? getRelatedLinks(links, node) : []
    const groupedRelatedLinks = (node) ? groupRelatedLinks(relatedLinks, node) : {}
    return <div>
      <p>Click on a node to find out more about it. Click it again to unselect.</p>
      {(node)
        ? <div>
          <h2 className='heading-medium'>{node.id}</h2>
          <ul>
            {Object.keys(groupedRelatedLinks).sort().map((type, idx) =>
              <Relationship
                allNodes={allNodes}
                key={idx}
                nodes={groupedRelatedLinks[type]}
                onNodeClick={this.props.onNodeClick}
                onNodeMouseOver={this.props.onNodeMouseOver}
                onNodeMouseOut={this.props.onNodeMouseOut}
                type={type}
              />
            )}
          </ul>
        </div>
        : null
      }
    </div>
  }
}
