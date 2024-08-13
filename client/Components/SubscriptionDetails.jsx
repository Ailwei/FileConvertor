import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
//import '../src/assets/subscriptionDetails.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const SubscriptionDetails = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelStatus, setCancellationStatus] = useState(null);

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
        const response = await axios.get(`https://51.21.127.210/auth/current-subscription/${userId}`);
        setSubscription(response.data);
        setError(null);
        setCancellationStatus(null);
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
      const response = await axios.delete(`https://51.21.127.210/auth/cancel-subscription/${userId}`);

      if (response.data.message.includes('LifeTime')) {
        setCancellationStatus('Lifetime plans cannot be cancelled.');
      } else {
        setCancellationStatus('Your subscription will be cancelled at the end of the current period.');

      }
      setSubscription(null);
      setError(null);
      
    
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError('User not found');
        } else if (err.response.status === 400) {
              setError('Lifetime plans cannot be cancelled')

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
  const isLifetime = subscription.plan.toLowerCase() === 'lifetime';
  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <h2 className="card-title mb-4">Current Subscription Details</h2>
        <div className="mb-3">
          {cancelStatus && <p className="text-warning text-center">{cancelStatus}</p>}
          <p><strong>Plan:</strong> {subscription.plan}</p>
          <p><strong>Amount:</strong> {subscription.amount / 100} {subscription.currency}</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p><strong>Expiry Date:</strong> {isLifetime ? 'No Expiry Date For this Plan' : new Date(subscription.endDate).toLocaleDateString()}</p>
          <p><strong>Days Remaining:</strong> {isLifetime ? 'Unlimited' : `${subscription.daysRemaining} days`}</p>
        </div>
        {!isLifetime && (
          <button className="btn btn-danger" onClick={handleCancelSubscription}>Cancel Subscription</button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
