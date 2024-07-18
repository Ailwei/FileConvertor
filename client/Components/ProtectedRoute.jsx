import  {}from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const authToken = sessionStorage.getItem('authToken');
  
  if (!authToken) {
    return <Navigate to="/login" />;
  }

  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
