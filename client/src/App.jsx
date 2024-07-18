import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from '../Components/Signup';
import Login from '../Components/Login';
import ForgotPassword from '../Components/ForgotPassword';
import ResetPassword from '../Components/ResetPassword';
import Dashboard from '../Components/Dashboard';
import Home from '../Components/Home.jsx';
import ProtectedRoute from '../Components/ProtectedRoute';
import Subscription from '../Components/Subscription';



function App() {
  const [selectedPackage, setSelectedPackage] = useState('');



  const closeModal = () => {
    console.log('Close modal implementation');
  };

  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
