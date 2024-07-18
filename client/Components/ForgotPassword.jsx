import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../src/assets/ForgotPassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleForgetPassword = (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        axios.post("http://localhost:3000/auth/forgot-password", { email })
            .then(response => {
                if (response.data.status) {
                    alert("Check your email for reset instructions");
                    navigate('/login');
                } else {
                    setError(response.data.message || 'Error sending email');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setError('Error sending email');
            });
    };

    return (
        <div className='forgotPassword-container'>
            <h1>Forgot Password</h1>
            <form className='forgotPassword-form' onSubmit={handleForgetPassword}>
            {error && <p className="error-message">{error}</p>}
                <label htmlFor="email">Email:</label> <br />
                <input
                    type='email'
                    placeholder='joedoe@mail.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                /> 
                <button type="submit">Send</button>
            </form>
            <p>Remembered your password? <Link to="/login">Login</Link></p>
        </div>
    );
}

export default ForgotPassword;
