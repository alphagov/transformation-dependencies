export function getRelatedNodes (links, node) {
  const isRelatedLink = l => l.source.id === node.id || l.target.id === node.id
  const linkToRelatedNode = l => (l.source.id === node.id) ? l.target : l.source
  return links
    .filter(isRelatedLink)
    .map(linkToRelatedNode)
}
