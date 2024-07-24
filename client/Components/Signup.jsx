import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
//import '../src/assets/SignUp.css';

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

<<<<<<< HEAD
    axios.post("http://localhost:3000/auth/signup", { firstname, lastname, email, password })
=======
    axios.post("file-convertor-api.vercel.app/auth/signup", { firstname, lastname, email, password })
>>>>>>> parent of 45a6196 (Update Signup.jsx)
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
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="text-center mb-4">Sign Up</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="firstname" className="form-label">Firstname:</label>
            <input
              type="text"
              className="form-control"
              id="firstname"
              placeholder="Firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastname" className="form-label">Lastname:</label>
            <input
              type="text"
              className="form-control"
              id="lastname"
              placeholder="Lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="johndoe@email.com"
              autoComplete='off'
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
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
          <p className="mt-3 text-center">
            Already have an account? <Link to="/login" className="btn btn-link">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
