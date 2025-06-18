import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './header';
import Footer from './footer';

function Signup() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!firstname || !lastname || !email || !password) {
      setError('All fields are required.');
      return;
    }

    axios.post("http://localhost:3000/auth/signup", {
      firstname, lastname, email, password
    })
      .then(response => {
        console.log(response.data);
        navigate('/login');
      })
      .catch(err => {
        console.error('Error during signup:', err.response);
        if (err.response && err.response.status === 400) {
          setError(err.response.data.message);
        } else {
          setError('Signup failed. Please try again.');
        }
      });
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Header />
      <div className="container flex-grow-1 d-flex justify-content-center align-items-center mt-5">
  <div className="card shadow p-4 rounded-4" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 className="text-center mb-4">Create Account</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="firstname" className="form-label">First Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="firstname"
                placeholder="Tshimuga"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastname" className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="lastname"
                placeholder="Mafatha"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                placeholder="john@email.com"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg">Sign Up</button>
            </div>
            <div className="text-center mt-3">
              <small>
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none fw-semibold">Log in</Link>
              </small>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Signup;
