import React, { Component } from 'react'

export default class GraphKey extends Component {

  render () {
    return <div>
      <h2 className="heading-medium">Dependency types</h2>
      <ul className="colors-key">
        <li><div className="policy-area"></div> = Policy Area</li>
        <li><div className="resource-sharing"></div> = Resource Sharing</li>
        <li> <div className="shared-location"></div> = Shared Location</li>
        <li><div className="technical-integration"></div> = Technical Integration</li>
        <li><div className="data-access"></div> = Data Access</li>
        <li><div className="unknown"></div> = Data Access</li>
      </ul>
    </div>
  }
}
