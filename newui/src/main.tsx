import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import '@/index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found. Ensure there is a <div id="root"> in index.html.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
