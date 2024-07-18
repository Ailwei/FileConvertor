import  { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import PropTypes from 'prop-types';

const UpdateProfile = ({ onClose }) => {
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
        console.error('Error fetching user details:', error);
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
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              name="firstname"
              value={userDetails.firstname}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastname"
              value={userDetails.lastname}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

UpdateProfile.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UpdateProfile;
