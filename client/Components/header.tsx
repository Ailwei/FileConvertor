import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header bg-light py-3">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand" to="/">
            File Conversion Service
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav d-flex flex-row ml-auto">
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link">Register</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;