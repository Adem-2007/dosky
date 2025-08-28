// App.jsx
import React from 'react';
import { Route, Switch } from "wouter";
import Navbar from './common/navbar/Navbar';
import HomePage from './page/Home/Home';
import PricingPage from './page/Pricing/PricingPage';
import AuthPage from './page/Auth/AuthPage';
import VerifyPage from './page/Auth/VerifyPage';
import ContactPage from './page/contact/ContactPage';
import ServicesPage from './page/Services/ServicesPage';
import SummuaryUpload from './page/tools/summuraize/SummuaryUpload';
import SummuraizeRusult from './page/tools/summuraize/SummuraizeRusult';
import ChatUpload from './page/tools/chat/ChatUpload';
import ChatResult from './page/tools/chat/ChatResult';
import NoInternetPage from './page/noInternet/NoInternetPage';
import useOnlineStatus from './hooks/useOnlineStatus';
import ProtectedRoute from './common/ProtectedRoute'; // <-- IMPORT
import PublicRoute from './common/PublicRoute';     // <-- IMPORT

function App() {
  const isOnline = useOnlineStatus();

  // If the user is offline, render the NoInternetPage exclusively.
  if (!isOnline) {
    return <NoInternetPage />;
  }

  // Otherwise, render the main application.
  return (
    <div className="bg-[#F7F4EF] min-h-screen antialiased text-[#2C3A47]">
      <Navbar />
      
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/pricing" component={PricingPage} />
          <Route path="/contact" component={ContactPage} />
          
          {/* Auth page is now a public route to redirect logged-in users */}
          <PublicRoute path="/auth" component={AuthPage} />
          
          <Route path="/verify" component={VerifyPage} />
          <Route path="/services" component={ServicesPage} />
          
          {/* --- PROTECTED ROUTES --- */}
          {/* Summarize Routes */}
          <ProtectedRoute path="/tools/summarize" component={SummuaryUpload} />
          <ProtectedRoute path="/tools/summary-result" component={SummuraizeRusult} />

          {/* Chat Routes */}
          <ProtectedRoute path="/tools/chat" component={ChatUpload} />
          <ProtectedRoute path="/tools/chat-result" component={ChatResult} />
          {/* --- END PROTECTED ROUTES --- */}
          
          <Route>
             <div className="text-center py-40">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-lg">Page Not Found!</p>
             </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;