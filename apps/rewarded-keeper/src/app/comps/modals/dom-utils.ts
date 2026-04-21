export function safeRemoveNode(node: Node): void {
  if (!node.parentNode) return;
  node.parentNode.removeChild(node);
}
