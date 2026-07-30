import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Add a visible loading indicator that will be replaced when React mounts
const rootEl = document.getElementById('root')
if (rootEl && rootEl.children.length === 0) {
  rootEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#94a3b8;font-family:system-ui,sans-serif;font-size:18px;">正在加载飞机坦克大战...</div>'
}

ReactDOM.createRoot(rootEl!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
