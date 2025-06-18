import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import AboutUs from './aboutUs';
import Footer from './footer';
import Header from './header';

const Home = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      sessionStorage.setItem('redirectPath', '/dashboard');
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      <Header/>

  <section className="py-5 text-center bg-primary text-white">
  <div className="container">
    <h1 className="display-5 fw-bold">Convert Files Effortlessly</h1>
    <p className="lead text-white">Choose the plan that fits your needs.</p>
    <div className="row mt-4 g-4 text-start">
      {[
        {
          title: "Basic Plan",
          details: [
            "Convert up to 10 files",
            "Convert documents (pdf, docx)",
            "Convert images (png, jpeg)",
            "Convert video/Audio (mp4, mp3)",
            "Charged after trial period",
          ],
          price: "Free",
        },
        {
          title: "Premium",
          details: [
            "Convert up to 100 files/month",
            "Convert documents (pdf, docx)",
            "Convert images (png, jpeg)",
            "Convert video/Audio (mp4, mp3)",
            "Email support",
          ],
          price: "R500/month",
        },
        {
          title: "Life Time",
          details: [
            "Unlimited file conversions",
            "Convert documents (pdf, docx)",
            "Convert images (png, jpeg)",
            "Convert video/Audio (mp4, mp3)",
            "Priority support",
          ],
          price: "R1500/month",
        },
      ].map((plan, i) => (
        <div className="col-md-4" key={i}>
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{plan.title}</h5>
              {plan.details.map((d, j) => (
                <p className="card-text mb-2" key={j}>{d}</p>
              ))}
              <p className="fw-bold mt-3">{plan.price}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <button className="btn btn-primary mt-5" onClick={handleGetStarted}>
      Get Started
    </button>
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