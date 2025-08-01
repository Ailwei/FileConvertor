import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from '../Components/Signup';
import Login from '../Components/Login';
import ForgotPassword from '../Components/ForgotPassword';
import ResetPassword from '../Components/ResetPassword';
import Dashboard from '../Components/Dashboard';
import Home from '../Components/Home.jsx';
import ProtectedRoute from '../Components/ProtectedRoute';
import Subscription from '../Components/Subscription';
import Plans from '../Components/Plans';
import CheckoutForm from '../Components/CheckOut';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe publishable key from environment variables using import.meta.env
const stripePromise = loadStripe("pk_test_51Pb0jPRv2iwRaKJ6HZNgAmE4GfJiqHvrv7wy8TL6O2Sc10a1wytwy83qwJx1Nn41agQtbvyN7WeVSJb68z8LiaE100DoaHZbR4");

function App() {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const closeModal = () => {
    console.log('Close modal implementation');
  };

  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <Routes>
          <Route 
            path="/" 
            element={<Home setSelectedPackage={setSelectedPackage} isLoggedIn={!!sessionStorage.getItem('authToken')} />} 
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          {selectedPackage === '' && (
            <Route path="/subscription" element={<Subscription plan={selectedPackage} closeModal={closeModal} />} />
          )}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard selectedPackage={selectedPackage} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <CheckoutForm plan={selectedPackage} userId={userId} closeModal={closeModal} />
            } 
          />
        </Routes>
      </Elements>
    </BrowserRouter>
  );
}

export default App;