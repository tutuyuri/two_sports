import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./estilo/cores.css"
import './index.css'
import { App } from './App.jsx'
import './estilo/acessibilidade.css'
import { iniciarPreferencias } from './utils/preferencias.js'
import { iniciarTemaPersonalizado } from './utils/temaPersonalizado.js'

iniciarPreferencias();
iniciarTemaPersonalizado();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)