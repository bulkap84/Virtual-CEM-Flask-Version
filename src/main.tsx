import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import './index.css'
// We will create App.tsx or use Home directly in next steps. 
// For now, let's create a placeholder App component inside here or reference one.
// I'll assume we will create App.tsx.

import App from './App'

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)
