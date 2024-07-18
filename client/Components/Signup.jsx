import {useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../src/assets/SignUp.css';

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

    axios.post("http://localhost:3000/auth/signup", { firstname,lastname, email, password })
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
    <div className='sign-up-container'>
      <h1>Sign Up</h1>
      <form className='signup-form' onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label htmlFor='lastname'>Firstname:</label><br />
        <input
          type="text"
          placeholder="firstname"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
        /><br />
        <label htmlFor='lastname'>Lastname:</label><br />
        <input
          type="text"
          placeholder="lastname"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
        /><br />
        <label htmlFor='email'>Email:</label><br />
        <input
          type="email"
          placeholder="johndoe@email.com"
          autoComplete='false'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <label htmlFor='password'>Password:</label><br />
        <input
          type="password"
          placeholder="*********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Sign up</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

export default Signup;
