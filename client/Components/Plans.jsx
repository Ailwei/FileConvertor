import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Alert } from 'react-bootstrap';
import '../src/assets/Checkout.css';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ZA', name: 'South Africa' },
];

const plans = [
  {
    name: 'Free Trial',
    planType: 'free-trial',
    price: 0,
    description: 'Try our service free for 7 days. No payment information required.',
  },
  {
    name: 'Basic',
    planType: 'basic',
    price: 5000, // Price in cents
    description: 'Basic plan with essential features. Monthly billing at 50.00 ZAR.',
  },
  {
    name: 'Premium',
    planType: 'premium',
    price: 35000, // Price in cents
    description: 'Premium plan with all features. Monthly billing at 350.00 ZAR.',
  },
];

const Plans = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    fullname: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [decodedToken, setDecodedToken] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(''); // New state to manage payment status

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      const decoded = jwt_decode(token);
      setDecodedToken(decoded);
    }
  }, []);

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        if (decodedToken) {
          const response = await axios.get(`http://localhost:3000/auth/current-subscription/${decodedToken.userId}`);
          setActivePlan(response.data.activePlan);
        }
      } catch (error) {
        console.error('Error fetching active plan:', error);
      }
    };

    fetchActivePlan();
  }, [decodedToken]);

  useEffect(() => {
    if (selectedPlan && decodedToken) {
      const fetchClientSecret = async () => {
        try {
          const paymentIntentResponse = await axios.post('http://localhost:3000/auth/create-payment-intent', {
            plan: selectedPlan.planType,
            userId: decodedToken.userId,
          });

          setClientSecret(paymentIntentResponse.data.clientSecret);
          setPaymentStatus(paymentIntentResponse.data.status || ''); // Set payment status if available
        } catch (error) {
          console.error('Error fetching client secret:', error);
        }
      };

      fetchClientSecret();
    }
  }, [selectedPlan, decodedToken]);

  useEffect(() => {
    if (decodedToken) {
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/auth/user/${decodedToken.userId}`);
          const { firstname, lastname, email } = response.data;
          setBillingDetails((prevDetails) => ({
            ...prevDetails,
            fullname: `${firstname} ${lastname}`,
            email,
          }));
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      };

      fetchUserDetails();
    }
  }, [decodedToken]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || !decodedToken) {
      return;
    }

    try {
      let response;

      if (selectedPlan && selectedPlan.planType === 'free-trial') {
        response = await axios.post('http://localhost:3000/auth/update-status', {
          userId: decodedToken.userId,
          status: 'trial',
          billingDetails,
        });
      } else {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: billingDetails.fullname,
              email: billingDetails.email,
              address: {
                line1: billingDetails.address,
                city: billingDetails.city,
                postal_code: billingDetails.postalCode,
                country: billingDetails.country,
              },
            },
          },
        });

        if (error) {
          setError('Payment failed: ' + error.message);
          console.error('Payment failed:', error);
          return;
        }

        response = await axios.post('http://localhost:3000/auth/update-status', {
          userId: decodedToken.userId,
          paymentIntentId: paymentIntent.id,
          status: 'paid',
          billingDetails,
        });
      }

      if (response.status === 200) {
        alert(selectedPlan && selectedPlan.planType === 'free-trial' ? 'Free trial subscription succeeded!' : 'Payment succeeded!');
        setShowModal(false);
        window.location.href = '/dashboard';
      }
    } catch (updateError) {
      setError('Error handling payment: ' + updateError.message);
      console.error('Error handling payment:', updateError);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Select Your Plan</h2>
      <div className="row">
        {plans.map((plan) => (
          <div className="col-md-4 mb-4" key={plan.planType}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{plan.name}</h5>
                <p className="card-text">{plan.description}</p>
                <p className="card-text">
                  Price: {plan.price === 0 ? 'Free' : `${plan.price / 100} ZAR`}
                </p>
                <Button
                  variant="primary"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={activePlan && activePlan.plan === plan.planType}
                >
                  {activePlan && activePlan.plan === plan.planType
                    ? 'Current Plan'
                    : 'Select Plan'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullname" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="fullname"
                name="fullname"
                value={billingDetails.fullname}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={billingDetails.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={billingDetails.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="city" className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                id="city"
                name="city"
                value={billingDetails.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="postalCode" className="form-label">Postal Code</label>
              <input
                type="text"
                className="form-control"
                id="postalCode"
                name="postalCode"
                value={billingDetails.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="country" className="form-label">Country</label>
              <select
                className="form-select"
                id="country"
                name="country"
                value={billingDetails.country}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="card-element" className="form-label">Credit or Debit Card</label>
              <CardElement id="card-element" />
            </div>
            <Button variant="primary" type="submit" disabled={!stripe}>
              {selectedPlan && selectedPlan.planType === 'free-trial'
                ? 'Start Free Trial'
                : 'Pay and Subscribe'}
            </Button>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

Plans.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default Plans;
