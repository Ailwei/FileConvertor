import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import jwt_decode from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import CheckoutForm from './CheckOut';
import '../src/assets/Plan.css';

const plans = [
  {
    name: 'Basic',
    planType: 'basic',
    price: 0,
    description: 'Convert up to 10 files during trial time',
    detail: 'Convert Documents pdf/docx',
    detail1: 'Convert Video/Audio mp3/mp4',
    detail2: 'Convert Images png/jpeg'
  },
  {
    name: 'Premium',
    planType: 'premium',
    price: 50000,
    description: 'Convert up to 50 files during trial time',
    detail: 'Convert Documents pdf/docx',
    detail2: 'Convert Images png/jpeg',
  },
  {
    name: 'Life Time',
    planType: 'LifeTime',
    price: 150000,
    description: 'Unlimited File Conversion',
    detail: 'Convert Documents pdf/docx',
    detail1: 'Convert Video/Audio mp3/mp4',
    detail2: 'Convert Images png/jpeg'
  },
];

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
          if (response.status === 200) {
            setActivePlan(response.data.activePlan);
          }
        }
      } catch (error) {
        console.error('Error fetching active plan:', error);
      }
    };

    fetchActivePlan();
  }, [decodedToken]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Select Your Plan</h2>
      <div className="row">
        {plans.map((plan) => (
          <div className="col-md-4 mb-4" key={plan.planType}>
            <div className="card plan-card"> {/* Add the CSS class here */}
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
          <CheckoutForm plan={selectedPlan} userId={decodedToken?.userId} closeModal={() => setShowModal(false)} />
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