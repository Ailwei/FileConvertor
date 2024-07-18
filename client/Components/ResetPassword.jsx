import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import "../src/assets/ResetPassword.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = (e) => {
        e.preventDefault();

        axios.post(`http://localhost:3000/auth/reset-password/${token}`, { password })
            .then(response => {
                console.log('Response:', response.data);
                if (response.data.message === "updated record") {
                    alert("Password updated successfully");
                    navigate('/login');
                } else {
                    setError("Failed to update password. Please try again later.");
                }
            })
            .catch(err => {
                console.error('Error:', err); 
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError("An unexpected error occurred. Please try again later.");
                }
            });
    };

    return (
        <div className='forgotPassword-container'>
            <h1>Reset Password</h1>
            <form className='forgotPassword-form' onSubmit={handleResetPassword}>
            {error && <p className="error-message">{error}</p>}
                <label htmlFor="password">Password:</label> <br />
                <input 
                    type='password' 
                    placeholder='*********' 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                /> <br />
                <button type="submit">Reset Password</button>               
            </form>
            <p>Remembered your password? <Link to="/login">Login</Link></p>
        </div>
    );
}

export default ResetPassword;
