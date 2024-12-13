import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlusG, faFacebookF, faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const AuthForm = ({ isLogin, setIsLogin }) => {
    const [isActive, setIsActive] = useState(!isLogin);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setIsActive(!isLogin);
    }, [isLogin]);

    const handleRegisterClick = () => {
        setErrorMessage('');
        setIsActive(true);
    };

    const handleLoginClick = () => {
        setErrorMessage('');
        setIsActive(false);
    };

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            if (response.data.token) {
                if (response.data.user) {
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setTimeout(() => {
                        navigate('/menu');
                    }, 100);
                } else {
                    setErrorMessage('Invalid user data received');
                }
            } else {
                setErrorMessage('Invalid email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(
                error.response?.data?.message || 'An error occurred during login. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', { 
                user_name: name,
                email, 
                password 
            });
            
            if (response.data.user) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                // Reset form
                setName('');
                setEmail('');
                setPassword('');
                // Chuyển sang form đăng nhập
                handleLoginClick();
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage(
                error.response?.data?.message || 
                'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="auth-container">
            <div className={`container ${isActive ? 'active' : ''}`} id="container">
                {/* Form đăng ký */}
                <div className="form-container sign-up" style={{ display: isActive ? 'block' : 'none' }}>
                    <form onSubmit={handleSubmitRegister}>
                        <h1>Create Account</h1>
                        <div className="social-icons">
                            <span className="icon"><FontAwesomeIcon icon={faGooglePlusG} /></span>
                            <span className="icon"><FontAwesomeIcon icon={faFacebookF} /></span>
                            <span className="icon"><FontAwesomeIcon icon={faGithub} /></span>
                            <span className="icon"><FontAwesomeIcon icon={faLinkedinIn} /></span>
                        </div>
                        <span>or use your email for registration</span>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                {/* Form đăng nhập */}
                <div className="form-container sign-in" style={{ display: isActive ? 'none' : 'block' }}>
                    <form onSubmit={handleSubmitLogin}>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <span className="icon"><FontAwesomeIcon icon={faGooglePlusG} /></span>
                            <span className="icon"><FontAwesomeIcon icon={faFacebookF} /></span>
                            <span className="icon"><FontAwesomeIcon icon={faGithub} /></span>
                            <span className="icon"><FontAwesomeIcon icon={faLinkedinIn} /></span>
                        </div>
                        <span>or use your email and password</span>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Toggle giữa đăng ký và đăng nhập */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to continue</p>
                            <button className="hidden" onClick={handleLoginClick}>Sign In</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Sign up with your details to start your journey</p>
                            <button className="hidden" onClick={handleRegisterClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;  