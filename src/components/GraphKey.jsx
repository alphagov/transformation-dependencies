import React, { Component } from 'react'

export default class GraphKey extends Component {

  render () {
    return <div>
      <h2 className='heading-medium'>Dependency types</h2>
      <ul className='colors-key'>
        <li><div className='policy-area' /> = Policy Area</li>
        <li><div className='resource-sharing' /> = Resource Sharing</li>
        <li><div className='shared-location' /> = Shared Location</li>
        <li><div className='responsible-for' /> = Responsible For</li>
        <li><div className='technical-integration' /> = Technical Integration</li>
        <li><div className='data-access' /> = Data Access</li>
        <li><div className='unknown' /> = Unknown</li>
      </ul>
    </div>
  }
}
