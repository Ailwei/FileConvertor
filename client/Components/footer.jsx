import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer className="bg-light border-top mt-5 py-4">
      <div className="container">
        <div className="row text-center text-md-start">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="text-primary">File Conversion Service</h5>
            <p className="mb-1">&copy; 2024 File Conversion Service</p>
            <small className="text-muted">All rights reserved</small>
          </div>

          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><Link className="text-decoration-none text-primary" to="/about">About Us</Link></li>
              <li><Link className="text-decoration-none text-primary" to="/terms">Terms and Conditions</Link></li>
              <li><Link className="text-decoration-none text-primary" to="/privacy">Privacy Policy</Link></li>
              <li><Link className="text-decoration-none text-primary" to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="col-md-4">
            <h5>Follow Us</h5>
            <ul className="list-unstyled">
              <li><a className="text-decoration-none text-blue" href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a className="text-decoration-none text-blue" href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a className="text-decoration-none text-blue" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
