import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
//import '../src/assets/subscriptionDetails.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SubscriptionDetails = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;

      try {
        const response = await axios.get(`http://localhost:3000/auth/current-subscription/${userId}`);
        setSubscription(response.data);
        setError(null);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 406) {
            setError('No active subscription found');
          } else if (err.response.status === 408) {
            setError('No subscriptions found for this user');
          } else if (err.response.status === 401) {
            setError('Unauthorized request. Please log in.');
          } else if (err.response.status === 500) {
            setError('Internal server error. Please try again later.');
          } else {
            setError('An unexpected error occurred.');
          }
        } else {
          setError('No response from server. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionDetails();
  }, []);

  const handleCancelSubscription = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      setError('User not authenticated');
      return;
    }

    const decodedToken = jwt_decode(token);
    const userId = decodedToken.userId;

    try {
      await axios.delete(`http://localhost:3000/auth/cancel-subscription/${userId}`);
      setSubscription(null);
      setError(null);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 407) {
          setError('User not found');
        } else if (err.response.status === 500) {
          setError('Internal server error. Please try again later.');
        } else {
          setError('An unexpected error occurred.');
        }
      } else {
        setError('No response from server. Please check your connection.');
      }
    }
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  if (!subscription) {
    return <p className="text-center">No active subscription found</p>;
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <h2 className="card-title mb-4">Current Subscription Details</h2>
        <div className="mb-3">
          <p><strong>Plan:</strong> {subscription.plan}</p>
          <p><strong>Amount:</strong> {subscription.amount / 100} ZAR</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p><strong>Expiry Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
        </div>
        <button className="btn btn-danger" onClick={handleCancelSubscription}>Cancel Subscription</button>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
