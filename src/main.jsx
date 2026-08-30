import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'

// Fix: React crashes when Google Translate (browser extension) modifies the DOM
// by wrapping text nodes in <font> elements, making node references invalid.
// This patch makes insertBefore a no-op when the reference node has been moved,
// instead of throwing a NotFoundError that crashes the entire React tree.
if (typeof Node === 'function' && Node.prototype) {
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn(
        '[Google Translate Fix] insertBefore: referenceNode is not a child of this node. Skipping to prevent crash.',
        referenceNode
      );
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
