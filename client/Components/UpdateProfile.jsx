import { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
//import '../src/assets/UpdateProfile.css';

const UpdateProfile = ({ onClose }) => {
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (token) {
          const decoded = jwt_decode(token);

          const userDetailsResponse = await axios.get(`http://localhost:3000/auth/user/${decoded.userId}`);
          const { firstname, lastname, email } = userDetailsResponse.data;
          setUserDetails({
            firstname,
            lastname,
            email,
          });
        }
      } catch (error) {
        setError('Error fetching user details');
      }
    };

    fetchUserDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = sessionStorage.getItem('authToken');
      const decoded = jwt_decode(token);

      const response = await axios.put('http://localhost:3000/auth/profile', {
        userId: decoded.userId,
        firstname: userDetails.firstname,
        lastname: userDetails.lastname,
        email: userDetails.email,
      });

      if (response.status === 200) {
        alert('Profile updated successfully!');
        onClose();
      } 
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setError('Email address already exists');
      } else if (error.response && error.response.status === 404) {
        setError('User not found');
      } else {
        setError('Error updating profile');
      }
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Profile</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstname">First Name:</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  className="form-control"
                  value={userDetails.firstname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastname">Last Name:</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  className="form-control"
                  value={userDetails.lastname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

UpdateProfile.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UpdateProfile;
