import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import FileConvert from '../Components/ConvertFiles';
import UpdateProfile from '../Components/UpdateProfile';
import ConvertedFiles from '../Components/ConvertedFiles';
import Subscription from '../Components/Subscription';
import SubscriptionDetails from '../Components/SubscriptionDetails';
import '../src/assets/Dashboard.css';
import PropTypes from 'prop-types';

axios.defaults.withCredentials = true;

const Dashboard = ({ selectedPackage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFileConvert, setShowFileConvert] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(!!selectedPackage);

  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
      return;
    }
    axios.get('http://localhost:3000/auth/verify', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(res => {
        if (!res.data.status) {
          navigate('/');
        }
      })
      .catch(err => {
        console.error('Error verifying user:', err);
        navigate('/');
      });
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) {
      setShowSubscriptionModal(true);
    }
  }, [location]);

  const handleLogout = () => {
    axios.get('http://localhost:3000/auth/logout')
      .then(res => {
        if (res.data.status) {
          sessionStorage.removeItem('authToken');
          navigate('/');
        }
      })
      .catch(err => {
        console.error('Error logging out:', err);
      });
  };

  const closeModal = () => {
    setShowSubscriptionModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="navbar-brand">
              <h1 className="logo">File Conversion Service</h1>
            </div>
            <ul className="navbar-nav">
              <li className="nav-item">
                <button className="nav-btn" onClick={() => setShowFileConvert(true)}>Convert Files</button>
              </li>
              <li className="nav-item">
                <button className="nav-btn" onClick={() => setShowUpdateProfile(true)}>Update Profile</button>
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {showFileConvert && <FileConvert onClose={() => setShowFileConvert(false)} />}
      {showUpdateProfile && <UpdateProfile onClose={() => setShowUpdateProfile(false)} />}
      {showSubscriptionModal && (
        <Subscription plan={selectedPackage} closeModal={closeModal} />
      )}

      <section className="section">
        <h2>Project Overview</h2>
        <p>Key Features:</p>
        <ul>
          <li>User authentication and authorization</li>
          <li>File upload and conversion</li>
          <li>Subscription management</li>
          <li>Real-time notifications</li>
          <li>Email notifications</li>
        </ul>
      </section>

      <section className="section">
        <h2>User Management</h2>
        <p>Total Users: 1000</p>
        <p>Active Users: 800</p>
        <p>New Signups: 50/day</p>
        <ul>
          <li>Integrate Auth0 for user authentication</li>
          <li>Implement registration and login forms</li>
          <li>Develop user profile pages</li>
          <li>Manage user roles (free trial, basic, premium)</li>
        </ul>
      </section>

      <section className="section">
        <ConvertedFiles />
      </section>

      <section className="section">
        <h2>Notifications</h2>
        <p>Total Emails Sent: 2000</p>
        <p>Email Open Rate: 60%</p>
        <p>Total Real-Time Notifications: 500</p>
        <p>Delivery Success Rate: 99%</p>
        <ul>
          <li>Integrate SendGrid for email notifications</li>
          <li>Set up Pusher for real-time notifications</li>
          <li>Develop notification preferences for users</li>
        </ul>
      </section>

      <section className="section">
        <h2>Subscription Management</h2>
        <SubscriptionDetails />
      </section>
    </div>
  );
};

Dashboard.propTypes = {
  selectedPackage: PropTypes.string,
};

export default Dashboard;
