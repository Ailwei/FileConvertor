import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../src/assets/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AboutUs from './aboutUs';
import Footer from './footer';
import Header from './header';

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
      <Header/>

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

      <section className="about py-5" bgcolor="blue">
        <AboutUs/>
      </section>
      
      <section className="footer-section">
        <Footer />
      </section>
    </div>
  );
};

Home.propTypes = {
  setSelectedPackage: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default Home;
