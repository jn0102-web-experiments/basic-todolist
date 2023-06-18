import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './css/index.css'
import { Provider } from 'react-redux'
import { persistor, store } from './store.ts'
import { PersistGate } from 'redux-persist/integration/react'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from '@mui/material'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
