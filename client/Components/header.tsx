import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../src/assets/Header.css';

const Header = ({ setShowFileConvert, setShowUpdateProfile }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className="header bg-light py-3 shadow-sm">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand" to="/">
            <img src="/src/images/File.png" alt="File Conversion Service" className="logo" />
            File Conversion Service
          </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <button className="btn btn-primary me-2" onClick={() => setShowFileConvert(true)}>Convert Files</button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-secondary me-2" onClick={() => setShowUpdateProfile(true)}>Update Profile</button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="nav-link">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;