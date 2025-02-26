import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
//import '../src/assets/ForgotPassword.css';

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
                console.log('Response:', response.data);
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
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="text-center mb-4">Forgot Password</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleForgetPassword}>
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
                    <button type="submit" className="btn btn-primary w-100">Send</button>
                    <p className="mt-3 text-center">
                        Remembered your password? <Link to="/login" className="btn btn-link">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
