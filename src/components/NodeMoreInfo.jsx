import React, { Component } from 'react'
import PropTypes from '../propTypes'
import {getRelatedLinks, groupRelatedLinks} from '../utils'

class PrettyNodeList extends Component {
  static propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.string).isRequired
  }

  render () {
    const {nodes} = this.props
    return <ul style={{marginBottom: '1em'}}>
      {nodes.map((n, idx) =>
        <li key={idx} style={{
          listStyleType: 'disc',
          marginLeft: '1.25em'
        }}>{n}</li>
      )}
    </ul>
  }
}

class Relationship extends Component {
  static propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string.isRequired
  }

  render () {
    const {type, nodes} = this.props
    let Phrase = (() => {
      switch (type) {
        case 'source_unknown':
          return () => <span>has an <span className='colored-underline colored-underline--unknown'>unknown</span> link to</span>
        case 'target_unknown':
          return () => <span>has an <span className='colored-underline colored-underline--unknown'>unknown</span> link from</span>
        case 'source_policy_area':
          return () => <span>sets the <span className='colored-underline colored-underline--policy-area'>policy area</span> for</span>
        case 'target_policy_area':
          return () => <span>relies on a <span className='colored-underline colored-underline--policy-area'>policy area</span> set by</span>
        case 'source_resource_sharing':
          return () => <span><span className='colored-underline colored-underline--resource-sharing'>shares resources</span> to</span>
        case 'target_resource_sharing':
          return () => <span>gets <span className='colored-underline colored-underline--resource-sharing'>shared resources</span> from</span>
        case 'source_shared_location':
          return () => <span><span className='colored-underline colored-underline--shared-location'>shares a location</span> to</span>
        case 'target_shared_location':
          return () => <span><span className='colored-underline colored-underline--shared-location'>shares a location</span> from</span>
        case 'source_technical_integration':
          return () => <span>offers <span className='colored-underline colored-underline--technical-integration'>technical integration</span> to</span>
        case 'target_technical_integration':
          return () => <span>receives <span className='colored-underline colored-underline--technical-integration'>technical integration</span> from</span>
        case 'source_data_access':
          return () => <span>offers <span className='colored-underline colored-underline--data-access'>data access</span> to</span>
        case 'target_data_access':
          return () => <span><span className='colored-underline colored-underline--data-access'>accesses data</span> from</span>
        case 'source_responsible_for':
          return () => <span>is <span className='colored-underline colored-underline--responsible-for'>responsible for</span></span>
        case 'target_responsible_for':
          return () => <span>is <span className='colored-underline colored-underline--responsible-for'>dependent on</span></span>
      }
    })()

    return <div>
      <Phrase />
      <PrettyNodeList nodes={nodes} />
    </div>
  }
}

export default class NodeMoreInfo extends Component {
  static propTypes = {
    links: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })).isRequired,
    node: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }

  render () {
    const {links, node} = this.props
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
                key={idx}
                type={type}
                nodes={groupedRelatedLinks[type]}
              />
            )}
          </ul>
        </div>
        : null
      }
    </div>
  }
}
