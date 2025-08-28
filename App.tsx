import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShiftProvider } from './context/ShiftContext';
import { CartProvider } from './context/CartContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import CustomerPage from './pages/CustomerPage';
import SessionsPage from './pages/SessionsPage';
import PrivateRoute from './components/PrivateRoute';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ReceiptPage from './pages/ReceiptPage';
import ShiftReportPage from './pages/ShiftReportPage';

// Layout component to provide contexts to protected routes
const POSLayout: React.FC = () => (
  <ShiftProvider>
    <CartProvider>
      <Outlet />
    </CartProvider>
  </ShiftProvider>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            element={
              <PrivateRoute>
                <POSLayout />
              </PrivateRoute>
            } 
          >
            <Route path="/pos" element={<POSPage />} />
            <Route path="/pos/sessions" element={<SessionsPage />} />
            <Route path="/pos/customer/:sessionId" element={<CustomerPage />} />
            <Route path="/pos/history" element={<TransactionHistoryPage />} />
            <Route path="/pos/receipt/:transactionId" element={<ReceiptPage />} />
            <Route path="/pos/shift-report" element={<ShiftReportPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;