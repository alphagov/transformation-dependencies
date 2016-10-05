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

export function getRelatedNodes (links, node) {
  const linkToRelatedNode = l => (getLinkNodeId(l.source) === node.id) ? l.target : l.source
  return getRelatedLinks(links, node).map(linkToRelatedNode)
}
