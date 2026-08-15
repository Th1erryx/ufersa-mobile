import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MaterialsProvider } from './context/MaterialsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MaterialsProvider>
      <App />
    </MaterialsProvider>
  </React.StrictMode>,
)
