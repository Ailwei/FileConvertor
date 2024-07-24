import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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

    axios.post("https://file-convertor-api.vercel.app/auth/login", { email, password })
      .then(response => {
        if (response.data.status) {
          sessionStorage.setItem('authToken', response.data.token);

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
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 className="text-center mb-4">Login</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="joedoe@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Log In</button>
        </form>
        <div className="mt-3 text-center">
          <p><Link to="/forgotpassword" className="btn btn-link">Forgot Password</Link></p>
          <p>Need an account? <Link to="/signup" className="btn btn-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
