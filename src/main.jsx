import React, { StrictMode } from 'react' // Thêm "React" vào đây
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'

const isGithubPages = window.location.hostname.includes('github.io');

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={isGithubPages ? "/testReact" : "/"}>
  {/* <BrowserRouter > */}

    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
)