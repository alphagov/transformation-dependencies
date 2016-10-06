import {curry} from 'lodash'

// These colors are also defined in Application.scss
export const getColorFromDependencyType = {
  'unknown': '#6f777b',
  'policy_area': '#2E358B',
  'resource_sharing': '#D53880',
  'shared_location': '#df3034',
  'technical_integration': '#FFBF47',
  'data_access': '#28A197',
  'responsible_for': '#F47738'
}

const getLinkNodeId = (linkNode) => {
  return (typeof linkNode === 'object')
    ? linkNode.id
    : linkNode
}

const isRelatedLink = curry((node, link) => {
  const sourceIsRelated = getLinkNodeId(link.source) === node.id
  const targetIsRelated = getLinkNodeId(link.target) === node.id
  return sourceIsRelated || targetIsRelated
})

export function getRelatedLinks (links, node) {
  return links.filter(isRelatedLink(node))
}

// Groups a set of links by their dependency type to a specific node.
// Input:
//  links = [
//    { source: 1, target: 2, type: 'a' },
//    { source: 1, target: 3, type: 'a' },
//    { source: 1, target: 5, type: 'b' },
//    { source: 4, target: 1, type: 'b' },
//    { source: 3, target: 1, type: 'b' }
//  ]
// Output:
//  groupedRelatedLinks = {
//    'source_a': [2, 3],
//    'source_b': [5],
//    'target_b': [4, 3]
//  }
export function groupRelatedLinks (links, node) {
  return links.reduce((gRL, link) => {
    if (getLinkNodeId(link.source) === node.id) {
      const key = `source_${link.type}`
      gRL[key] = gRL[key] ? gRL[key].concat([link.target]) : [link.target]
    } else {
      const key = `target_${link.type}`
      gRL[key] = gRL[key] ? gRL[key].concat([link.source]) : [link.source]
    }
    return gRL
  }, {})
}

export function getRelatedNodes (links, node) {
  const linkToRelatedNode = l => (getLinkNodeId(l.source) === node.id) ? l.target : l.source
  return getRelatedLinks(links, node).map(linkToRelatedNode)
}
