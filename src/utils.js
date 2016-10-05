import {curry} from 'lodash'

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
