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
import 'bootstrap/dist/css/bootstrap.min.css';
import Plans from  '../Components/Plans';

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
    axios.get('https://file-convertor-api.vercel.app/auth/verify', {
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
    axios.get('https://file-convertor-api.vercel.app/auth/logout')
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
    <div className="dashboard container">
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <span className="navbar-brand">File Conversion Service</span>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <button className="btn btn-primary me-2" onClick={() => setShowFileConvert(true)}>Convert Files</button>
                </li>
                <li className="nav-item">
                  <button className="btn btn-secondary me-2" onClick={() => setShowUpdateProfile(true)}>Update Profile</button>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {showFileConvert && <FileConvert onClose={() => setShowFileConvert(false)} />}
      {showUpdateProfile && <UpdateProfile onClose={() => setShowUpdateProfile(false)} />}
      {showSubscriptionModal && (
        <Subscription plan={selectedPackage} closeModal={closeModal} />
      )}
      <section>
     <Plans/>
      </section>

      <section className="my-5">
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <ConvertedFiles />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <SubscriptionDetails />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

Dashboard.propTypes = {
  selectedPackage: PropTypes.string,
};

export default Dashboard;
