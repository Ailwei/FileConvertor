import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../src/assets/Home.css';

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
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="navbar-brand">
              <h1 className="logo">File Conversion Service</h1>
            </div>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link">Register</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1>Convert Files Effortlessly</h1>
          <p>Choose the plan that fits your needs.</p>
          <div className="pricing">
            <div className="plan">
              <h2>Free Trial</h2>
              <p>7-day trial</p>
              <p>Convert up to 10 files</p>
              <p>No credit card required</p>
              <p><strong>Free</strong></p>
              <button className="btn btn-primary" onClick={() => handlePackageSelection('free-trial')}>Start Free Trial</button>
            </div>
            <div className="plan">
              <h2>Basic</h2>
              <p>Convert up to 50 files/month</p>
              <p>Email support</p>
              <p><strong>R50/month</strong></p>
              <button className="btn btn-primary" onClick={() => handlePackageSelection('basic')}>Subscribe</button>
            </div>
            <div className="plan">
              <h2>Premium</h2>
              <p>Unlimited file conversions</p>
              <p>Priority support</p>
              <p><strong>R350/month</strong></p>
              <button className="btn btn-primary" onClick={() => handlePackageSelection('premium')}>Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h2>About Us</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla fringilla ligula vitae elit aliquet, ut lacinia lectus varius. Nullam id eleifend elit. Sed sit amet orci magna.</p>
          <p>Etiam vel ligula id libero malesuada eleifend sit amet id arcu. Mauris elementum justo sit amet orci varius, in convallis risus posuere.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
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
