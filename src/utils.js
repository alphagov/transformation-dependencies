export function getRelatedNodes (links, node) {
  const getLinkNodeId = ln => (typeof ln === 'object') ? ln.id : ln
  const isRelatedLink = l => getLinkNodeId(l.source) === node.id || getLinkNodeId(l.target) === node.id
  const linkToRelatedNode = l => (getLinkNodeId(l.source) === node.id) ? l.target : l.source
  return links
    .filter(isRelatedLink)
    .map(linkToRelatedNode)
}
