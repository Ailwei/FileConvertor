import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = (e) => {
        e.preventDefault();


        axios.post(`http://localhost:3000/auth/reset-password/${token}`, { password })

            .then(response => {
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
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="text-center mb-4">Reset Password</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password:</label>
                        <input 
                            type='password' 
                            className='form-control'
                            id="password"
                            placeholder='*********' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Reset Password</button>
                    <p className="mt-3 text-center">
                        Remembered your password? <Link to="/login" className="text-decoration-none fw-semibold">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
