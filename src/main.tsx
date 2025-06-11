import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Load Java language support
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
