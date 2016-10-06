import React, { Component } from 'react'
import PropTypes from '../propTypes'

export default class GraphKey extends Component {
  static propTypes = {
    onTypeClick: PropTypes.func.isRequired,
    visibleLinkTypes: PropTypes.shape({
      'unknown': PropTypes.bool.isRequired,
      'policy_area': PropTypes.bool.isRequired,
      'resource_sharing': PropTypes.bool.isRequired,
      'shared_location': PropTypes.bool.isRequired,
      'technical_integration': PropTypes.bool.isRequired,
      'data_access': PropTypes.bool.isRequired,
      'responsible_for': PropTypes.bool.isRequired
    }).isRequired
  }

  render () {
    const {onTypeClick, visibleLinkTypes} = this.props
    return <div className='grid-row'>
      <div className='column-one-half'>
        <h2 className='heading-medium'>Dependency types</h2>
        <ul className='colors-key colors-key-lines'>
          <li onClick={() => onTypeClick('policy_area')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['policy_area']} />
            <div className='policy-area' /> = Policy Area
          </li>
          <li onClick={() => onTypeClick('resource_sharing')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['resource_sharing']} />
            <div className='resource-sharing' /> = Resource Sharing
          </li>
          <li onClick={() => onTypeClick('shared_location')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['shared_location']} />
            <div className='shared-location' /> = Shared Location
          </li>
          <li onClick={() => onTypeClick('responsible_for')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['responsible_for']} />
            <div className='responsible-for' /> = Responsible For
          </li>
          <li onClick={() => onTypeClick('technical_integration')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['technical_integration']} />
            <div className='technical-integration' /> = Technical Integration
          </li>
          <li onClick={() => onTypeClick('data_access')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['data_access']} />
            <div className='data-access' /> = Data Access
          </li>
          <li onClick={() => onTypeClick('unknown')}>
            <input readOnly type='checkbox' checked={visibleLinkTypes['unknown']} />
            <div className='unknown' /> = Unknown
          </li>
        </ul>
      </div>
      <div className='column-one-half'>
        <h2 className='heading-medium'>Node types</h2>
        <ul className='colors-key colors-key-circles'>
          <li><div className='organisation' /> = Organisation</li>
          <li><div className='programme' /> = Programme</li>
          <li><div className='service' /> = Service</li>
        </ul>
      </div>
    </div>
  }
}
