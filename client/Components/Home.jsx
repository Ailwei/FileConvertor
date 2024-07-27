import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../src/assets/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
                  <h2 className="card-title">Basic Plan</h2>
                  <p className="card-text">Convert up to 10 files</p>
                  <p className="card-text">Convert documents(pdf, docx)</p>
                  <p className="card-text">Convert images(png,jpeg)</p>
                  <p className="card-text">Convert video/Audio(mp4, mp3)</p>
                  <p>Charged after trial period</p>
                  <p className="card-text"><strong>Free</strong></p>
                  <button className="btn btn-primary" onClick={() => handlePackageSelection('basic')}>Get Started</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 plan">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Premium</h2>
                  <p className="card-text">Convert up to 100 files/month</p>
                  <p className="card-text">Convert documents(pdf, docx)</p>
                  <p className="card-text">Convert images(png,jpeg)</p>
                  <p className="card-text">Convert video/Audio(mp4, mp3)</p>
                  <p className="card-text">Email support</p>
                  <p className="card-text"><strong>R500/month</strong></p>
                  <button className="btn btn-primary" onClick={() => handlePackageSelection('premium')}>Get Started</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 plan">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Life Time</h2>
                  <p className="card-text">Unlimited file conversions</p>
                  <p className="card-text">Convert documents(pdf, docx)</p>
                  <p className="card-text">Convert images(png,jpeg)</p>
                  <p className="card-text">Convert video/Audio(mp4, mp3)</p>
                  <p className="card-text">Priority support</p>
                  <p className="card-text"><strong>R1500/month</strong></p>
                  <button className="btn btn-primary" onClick={() => handlePackageSelection('LifeTime')}>Get Started</button>
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
