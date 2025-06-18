import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './header';
import Footer from './footer';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    axios.post("http://localhost:3000/auth/login", { email, password })
      .then(response => {
        if (response.data.status) {
          const token = response.data.token;
          sessionStorage.setItem('authToken', token);
          const decodedToken = jwt_decode(token);
          sessionStorage.setItem('userId', decodedToken.userId);

          const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
          sessionStorage.removeItem('redirectPath');
          navigate(redirectPath);
        } else {
          setError('Login failed: ' + response.data.message);
        }
      })
      .catch(error => {
        if (error.response) {
          const status = error.response.status;
          if (status === 400) {
            setError('Login failed: User not registered.');
          } else if (status === 401) {
            setError('Login failed: Password is incorrect.');
          } else if (status === 500) {
            setError('Login failed: Internal server error.');
          } else {
            setError('Login failed. Please try again.');
          }
        } else if (error.request) {
          setError('Login failed. No response from server.');
        } else {
          setError('Login failed. Please try again.');
        }
      });
  };

  return (
    <div className="bg-light d-flex flex-column min-vh-100">
      <Header />
      <div className="container flex-grow-1 d-flex justify-content-center align-items-center mt-5">
  <div className="card shadow p-4 rounded-4" style={{ maxWidth: '500px', width: '100%', height: '505px' }}>
          <h2 className="text-center mb-4">Login</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                placeholder="joedoe@email.com"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid mb-6">
              <button type="submit" className="btn btn-primary btn-lg">Log In</button>
            </div>
          </form>

          <div className="text-center mt-3 mb-7">
            <Link to="/forgotpassword" className="text-decoration-none">Forgot Password?</Link>
          </div>
          <div className="text-center mt-2">
            <small>
              Don’t have an account?{' '}
              <Link to="/signup" className="text-decoration-none fw-semibold">Sign up</Link>
            </small>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
