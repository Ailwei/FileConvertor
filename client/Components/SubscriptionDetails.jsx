import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

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
      } catch (error) {
        setError('No subscription details found for this user');
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
    } catch (error) {
      setError('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!subscription) {
    return <p>No active subscription found</p>;
  }

  return (
    <div>
      <h2>Current Subscription Details</h2>
      <p>Plan: {subscription.plan}</p>
      <p>Amount: {subscription.amount / 100} ZAR</p>
      <p>Status: {subscription.status}</p>
      <p>Expiry Date: {new Date(subscription.endDate).toLocaleDateString()}</p>

      <button onClick={handleCancelSubscription}>Cancel Subscription</button>
    </div>
  );
};

export default SubscriptionDetails;
