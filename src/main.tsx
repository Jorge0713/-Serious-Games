import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/pixelify-sans/index.css'
import '@fontsource/vt323/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

