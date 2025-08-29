import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from './context/AuthContext.jsx';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// IMPORTANT: Replace this with your actual PayPal Sandbox Client ID
const PAYPAL_CLIENT_ID = "AePpoF0ZOmXDo57WzUJdTJKruynYBKnjPVoTMXo5wI0qDR4geQSpJUpbc9uQjGk9jMKlyLJVRJMi4nG-";

const initialPayPalOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

// This line uses `react-dom/client` to create the root of your application.
// This is the required starting point for any React web app.
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <PayPalScriptProvider options={initialPayPalOptions}>
        <App />
      </PayPalScriptProvider>
    </AuthProvider>
  </React.StrictMode>
);