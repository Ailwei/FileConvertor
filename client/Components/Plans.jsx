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
    description: 'Convert up to 10 files during trial time',
    detail: 'Convert Documents pdf/docx',
    detail1: 'Convert Video/Audio  mp3/mp4',
    detail2: 'Convert Images png/jpeg'

  },
  {
    name: 'Basic',
    planType: 'basic',
    price: 5000,
    description: 'Convert up to 50 files during trial time',
    detail: 'Convert Documents pdf/docx',
    detail2: 'Convert Images png/jpeg',
  },
  {
    name: 'Premium',
    planType: 'premium',
    price: 35000,
    description: 'Unlimited File Conversion',
    detail: 'Convert Documents pdf/docx',
    detail1: 'Convert Video/Audio  mp3/mp4',
    detail2: 'Convert Images png/jpeg'
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
  const [paymentStatus, setPaymentStatus] = useState('');

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
<<<<<<< HEAD
          const response = await axios.get(`http://localhost:3000/auth/current-subscription/${decodedToken.userId}`);
=======
          const response = await axios.get(`file-convertor-api.vercel.app/auth/current-subscription/${decodedToken.userId}`);
>>>>>>> parent of 24be643 (Update Plans.jsx)
          if (response.status === 200) {
            setActivePlan(response.data.activePlan);
          }
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            setError('Invalid plan selected');
          } else if (error.response.status === 401) {
            setError('User already has an active subscription');
          } else if (error.response.status === 500) {
            setError('Internal server error while fetching client secret');
          } else {
            setError('Error fetching client secret: ' + (error.response.data.error || error.message));
          }
        } else {
          setError('Network or server error');
        }
        console.error('Error fetching client secret:', error);
      }
    };

    fetchActivePlan();
  }, [decodedToken]);

  useEffect(() => {
    if (selectedPlan && decodedToken) {
      const fetchClientSecret = async () => {
        try {
<<<<<<< HEAD
          const paymentIntentResponse = await axios.post('http://localhost:3000/auth/create-payment-intent', {
=======
          const paymentIntentResponse = await axios.post('file-convertor-api.vercel.app/auth/create-payment-intent', {
>>>>>>> parent of 24be643 (Update Plans.jsx)
            plan: selectedPlan.planType,
            userId: decodedToken.userId,
          });

          if (paymentIntentResponse.status === 200) {
            setClientSecret(paymentIntentResponse.data.clientSecret);
            setPaymentStatus(paymentIntentResponse.data.status || '');
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 400) {
              setError('Invalid plan selected');
            } else if (error.response.status === 401) {
              setError('User already has an active subscription');
            } else if (error.response.status === 500) {
              setError('Internal server error while fetching client secret');
            } else {
              setError('Error fetching client secret: ' + (error.response.data.error || error.message));
            }
          } else {
            setError('Network or server error');
          }
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
<<<<<<< HEAD
          const response = await axios.get(`http://localhost:3000/auth/user/${decodedToken.userId}`);
=======
          const response = await axios.get(`file-convertor-api.vercel.app/auth/user/${decodedToken.userId}`);
>>>>>>> parent of 24be643 (Update Plans.jsx)
          if (response.status === 200) {
            const { firstname, lastname, email } = response.data;
            setBillingDetails((prevDetails) => ({
              ...prevDetails,
              fullname: `${firstname} ${lastname}`,
              email,
            }));
          }
        } catch (error) {
          setError('Error fetching user details: ' + (error.response?.data?.message || error.message));
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
      setError('Stripe or Elements not loaded or clientSecret not available');
      return;
    }

    try {
      let response;

      if (selectedPlan && selectedPlan.planType === 'free-trial') {
<<<<<<< HEAD
        response = await axios.post('http://localhost:3000/auth/update-status', {
=======
        response = await axios.post('file-convertor-api.vercel.app/auth/update-status', {
>>>>>>> parent of 24be643 (Update Plans.jsx)
          userId: decodedToken.userId,
          status: 'trial',
          billingDetails,
        });

        if (response.status === 200) {
          alert('Free trial subscription succeeded!');
          setShowModal(false);
          window.location.href = '/dashboard';
        }
      } else {
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
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

        if (stripeError) {
          setError('Payment failed: ' + stripeError.message);
          console.error('Payment failed:', stripeError);
          return;
        }

<<<<<<< HEAD
        response = await axios.post('http://localhost:3000/auth/update-status', {
=======
        response = await axios.post('file-convertor-api.vercel.app/auth/update-status', {
>>>>>>> parent of 24be643 (Update Plans.jsx)
          userId: decodedToken.userId,
          paymentIntentId: paymentIntent.id,
          status: 'paid',
          billingDetails,
        });

        if (response.status === 200) {
          alert('Payment succeeded!');
          setShowModal(false);
          window.location.href = '/dashboard'; 
        }
      }
    } catch (updateError) {
      if (updateError.response) {
        if (updateError.response.status === 400) {
          setError('Missing required fields in request body');
        } else if (updateError.response.status === 401) {
          setError('Missing payment intent ID or user already has an active subscription');
        } else if (updateError.response.status === 402) {
          setError('Payment intent not succeeded or not found');
        } else if (updateError.response.status === 405) {
          setError('User not found');
        } else if (updateError.response.status === 500) {
          setError('Internal server error while updating status');
        } else {
          setError('Error handling payment: ' + (updateError.response.data.message || updateError.message));
        }
      } else {
        setError('Network or server error');
      }
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
                <p className='card-text'>{plan.detail}</p>
                <p className='card-text'>{plan.detail1}</p>
                <p className='card-text'>{plan.detail2}</p>
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
          {error && <Alert variant="danger">{error}</Alert>}
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
              <label htmlFor="cardElement" className="form-label">Card Details</label>
              <CardElement className="form-control" id="cardElement" />
            </div>
            <Button type="submit" variant="primary" disabled={!stripe || !elements}>
              Pay {selectedPlan?.price / 100} ZAR
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

Plans.propTypes = {
  setShowModal: PropTypes.func.isRequired,
  setSelectedPlan: PropTypes.func.isRequired,
};

export default Plans;
