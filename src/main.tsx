import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MaterialsProvider } from './context/MaterialsContext'
import { GradesProvider } from './context/GradesContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GradesProvider>
      <MaterialsProvider>
        <App />
      </MaterialsProvider>
    </GradesProvider>
  </React.StrictMode>,
)
