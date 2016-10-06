import React, { Component } from 'react'
import PropTypes from '../propTypes'
import {getRelatedLinks} from '../utils'

class Relationship extends Component {
  static propTypes = {
    link: PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    }).isRequired,
    node: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }

  render () {
    const {link, node} = this.props
    let Phrase = () => <span>{node.id}</span>
    const src = link.source
    const tar = link.target
    const linkStartsFromNode = src === node.id
    switch (link.type) {
      case 'unknown':
        Phrase = (linkStartsFromNode)
          ? () => <span>has an <span className='colored-underline colored-underline--unknown'>unknown</span> link to {tar}</span>
          : () => <span>has an <span className='colored-underline colored-underline--unknown'>unknown</span> link from {src}</span>
        break
      case 'policy_area':
        Phrase = (linkStartsFromNode)
          ? () => <span>sets the <span className='colored-underline colored-underline--policy-area'>policy area</span> for {tar}</span>
          : () => <span>relies on a <span className='colored-underline colored-underline--policy-area'>policy area</span> set by {src}</span>
        break
      case 'resource_sharing':
        Phrase = (linkStartsFromNode)
          ? () => <span><span className='colored-underline colored-underline--resource-sharing'>shares resources</span> to {tar}</span>
          : () => <span>gets <span className='colored-underline colored-underline--resource-sharing'>shared resources</span> from {src}</span>
        break
      case 'shared_location':
        Phrase = (linkStartsFromNode)
          ? () => <span><span className='colored-underline colored-underline--shared-location'>shares a location</span> to {tar}</span>
          : () => <span><span className='colored-underline colored-underline--shared-location'>shares a location</span> from {src}</span>
        break
      case 'technical_integration':
        Phrase = (linkStartsFromNode)
          ? () => <span>offers <span className='colored-underline colored-underline--technical-integration'>technical integration</span> to {tar}</span>
        : () => <span>receives <span className='colored-underline colored-underline--technical-integration'>technical integration</span> from {src}</span>
        break
      case 'data_access':
        Phrase = (linkStartsFromNode)
          ? () => <span>offers <span className='colored-underline colored-underline--data-access'>data access</span> to {tar}</span>
          : () => <span><span className='colored-underline colored-underline--data-access'>accesses data</span> from {src}</span>
        break
      case 'responsible_for':
        Phrase = (linkStartsFromNode)
          ? () => <span>is <span className='colored-underline colored-underline--responsible-for'>responsible for</span> {tar}</span>
          : () => <span>is <span className='colored-underline colored-underline--responsible-for'>dependent on</span> {src}</span>
        break
    }
    return <div>
      … <Phrase />
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
    return <div>
      <p>Click on a node to find out more about it. Click it again to unselect.</p>
      {(node)
        ? <div>
          <h2 className='heading-medium'>{node.id}</h2>
          <ul>
            {relatedLinks.map((link, idx) =>
              <Relationship
                key={idx}
                link={link}
                node={node}
              />
            )}
          </ul>
        </div>
        : null
      }
    </div>
  }
}
