import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../src/assets/Login.css';

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


          sessionStorage.setItem('authToken', response.data.token);

          const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
          sessionStorage.removeItem('redirectPath');
          navigate(redirectPath);
        } else {
          setError('Login failed: ' + response.data.message);
        }
      })
      .catch(err => {
        setError('Login failed. Please try again.');
      });
  };

  return (
    <div className='login-container'>
      <form className='login-form' onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}
        <label htmlFor="email">Email:</label><br />
        <input
          type='email'
          placeholder='joedoe@mail.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <label htmlFor="password">Password:</label><br />
        <input
          type='password'
          placeholder='********'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Log In</button>
        <p><Link to="/forgotpassword">Forgot Password</Link></p>
        <p>Need an account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

export default Login;
