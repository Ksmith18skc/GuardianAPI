import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UIModeProvider } from './contexts/UIModeContext'
import { UIModeRoot } from './components/UIModeRoot'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIModeProvider>
      <UIModeRoot />
    </UIModeProvider>
  </StrictMode>,
)
