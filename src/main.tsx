import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { FlashcardsProvider } from './context/FlashcardsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/Ovcharenko-Frontend-Final/">
      <FlashcardsProvider>
        <App />
      </FlashcardsProvider>
    </BrowserRouter>
  </StrictMode>,
)
