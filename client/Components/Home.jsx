import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../src/assets/Home.css';
//import 'bootstrap/dist/css/bootstrap.min.css';

const Home = ({ setSelectedPackage, isLoggedIn }) => {
  const navigate = useNavigate();

  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
    sessionStorage.setItem('selectedPackage', pkg);
    if (isLoggedIn) {
      navigate(`/dashboard?plan=${pkg}`);
    } else {
      sessionStorage.setItem('redirectPath', `/dashboard?plan=${pkg}`);
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
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

      <section className="hero py-5 text-center">
        <div className="container">
          <h1>Convert Files Effortlessly</h1>
          <p>Choose the plan that fits your needs.</p>
          <div className="row pricing">
            <div className="col-md-4 plan">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Free Trial</h2>
                  <p className="card-text">7-day trial</p>
                  <p className="card-text">Convert up to 10 files</p>
                  <p className="card-text">Convert documents(pdf, docx)</p>
                  <p className="card-text">Convert images(png,jpeg)</p>
                  <p className="card-text">Convert video/Audio(mp4, mp3)</p>
                  <p className="card-text"><strong>Free</strong></p>
                  <button className="btn btn-primary" onClick={() => handlePackageSelection('free-trial')}>Start Free Trial</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 plan">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Basic</h2>
                  <p className="card-text">Convert up to 50 files/month</p>
                  <p className="card-text">Convert documents(pdf, docx)</p>
                  <p className="card-text">Convert images(png,jpeg)</p>
                  <p className="card-text">Email support</p>
                  <p className="card-text"><strong>R50/month</strong></p>
                  <button className="btn btn-primary" onClick={() => handlePackageSelection('basic')}>Subscribe</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 plan">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Premium</h2>
                  <p className="card-text">Unlimited file conversions</p>
                  <p className="card-text">Convert documents(pdf, docx)</p>
                  <p className="card-text">Convert images(png,jpeg)</p>
                  <p className="card-text">Convert video/Audio(mp4, mp3)</p>
                  <p className="card-text">Priority support</p>
                  <p className="card-text"><strong>R350/month</strong></p>
                  <button className="btn btn-primary" onClick={() => handlePackageSelection('premium')}>Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about py-5">
        <div className="container">
          <h2>About Us</h2>
          <p>
          File Conversion Service is a comprehensive platform designed to streamline the process of converting various types of files efficiently and effectively. Built with a modern tech stack including Node.js, Express.js, MongoDB, React, and Stripe, this application offers a seamless experience for users to manage their file conversion needs.
          </p>
        </div>
      </section>
      <section className="features py-5">
        <div className="container">
          <h2>Key Features</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">File Conversion</h3>
                  <p className="card-text">Convert documents, images, audio, and video files to different formats quickly and reliably.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">User Authentication</h3>
                  <p className="card-text">Secure login and registration system to manage user accounts and subscriptions.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Subscription Plans</h3>
                  <p className="card-text">Multiple subscription plans, including a free trial, basic, and premium options, to suit different user needs.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Profile Management</h3>
                  <p className="card-text">Users can update their profile information and manage their billing details.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">File Management</h3>
                  <p className="card-text">Easily upload, convert, and view converted files. The platform supports various file types and provides real-time conversion results.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Notifications</h3>
                  <p className="card-text">Real-time notifications and email updates keep users informed about their conversion status and other important updates.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Admin Dashboard</h3>
                  <p className="card-text">An administrative dashboard provides insights into user activity, file conversions, and subscription metrics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="how-it-work py-5">
        <div className="container">
          <h2>How It Works</h2>
          <p>
          <b>User Registration and Login:</b> Users sign up and log in to access their accounts and manage their file conversions.<br></br>
<b>Subscription Management:</b> Users can select from various subscription plans, including a free trial, and manage their subscription preferences.<br></br>
<b>File Conversion:</b> Users upload files, select conversion options, and receive converted files in their desired formats.<br></br>
<b>Profile Updates:</b> Users can update their profile information and billing details through the dashboard. <br></br>
<b>Notifications:</b> Users receive real-time notifications about their conversion status and other relevant updates.<br></br>
          </p>
        </div>
      </section>
      <footer className="footer bg-light py-3">
        <div className="container text-center">
          <p>&copy; 2024 File Conversion Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

Home.propTypes = {
  setSelectedPackage: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default Home;
