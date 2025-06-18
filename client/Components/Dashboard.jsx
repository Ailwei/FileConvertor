import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import FileConvert from '../Components/ConvertFiles';
import UpdateProfile from '../Components/UpdateProfile';
import ConvertedFiles from '../Components/ConvertedFiles';
import Subscription from '../Components/Subscription';
import SubscriptionDetails from '../Components/SubscriptionDetails';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import Plans from '../Components/Plans';
import Header from '../Components/header';
import Footer from '../Components/footer';

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
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Header setShowFileConvert={setShowFileConvert} setShowUpdateProfile={setShowUpdateProfile} />

      <main className="container my-4 flex-grow-1">
        {showFileConvert && (
          <div className="mb-4">
            <FileConvert onClose={() => setShowFileConvert(false)} />
          </div>
        )}

        {showUpdateProfile && (
          <div className="mb-4">
            <UpdateProfile onClose={() => setShowUpdateProfile(false)} />
          </div>
        )}

        {showSubscriptionModal && (
          <Subscription plan={selectedPackage} closeModal={closeModal} />
        )}

        <section className="mb-5">
          <Plans />
        </section>
<div className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Subscription Details</h5>
                  <SubscriptionDetails />
                </div>
              </div>
            </div>
        <section className="mb-5">
          <div className="row">
            <div className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Converted Files</h5>
                  <ConvertedFiles />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

Dashboard.propTypes = {
  selectedPackage: PropTypes.string,
};

export default Dashboard;
