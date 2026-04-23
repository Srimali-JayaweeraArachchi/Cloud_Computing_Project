import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';

const roleRoutes = {
  customer: '/customer',
  restaurant_owner: '/restaurant',
  admin: '/admin',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await authAPI.login({ email, password });
      login(response.data);
      const role = response.data.user.role;
      navigate(roleRoutes[role] || '/customer');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="auth-brand-block">
          <h1>Food Ordering App</h1>
        </div>
        <div className="auth-hero-copy">
          <p>Good food feels closer when every order moves with clarity.</p>
          <p>A shared space for customers, restaurant owners, and admins to keep every meal journey simple, timely, and trusted.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="section-eyebrow">Welcome back</div>
          <h2>Sign in to your dashboard</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error ? <div className="form-message error">{error}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
