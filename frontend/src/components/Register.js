import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { login } = React.useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await authAPI.register({ name, email, password, role });
      login(response.data);
      navigate(role === 'restaurant_owner' ? '/restaurant' : '/customer');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="auth-badge">Role-based onboarding</div>
        <h1>Create an account for the right side of the platform.</h1>
        <p>
          Customers can order instantly, while restaurant owners can register their restaurant and manage live orders after approval.
        </p>

        <div className="hero-feature-list">
          <div className="feature-card">
            <strong>Customer</strong>
            <span>Browse approved restaurants, build a cart, and follow order progress.</span>
          </div>
          <div className="feature-card">
            <strong>Restaurant Owner</strong>
            <span>Register your restaurant, add menu items, and move orders through delivery stages.</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="section-eyebrow">Get started</div>
          <h2>Create your account</h2>
          <p className="section-copy">This registration connects directly to the user service and stores your JWT session automatically.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label>
              <span>Email</span>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
              <span>Password</span>
              <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            <label>
              <span>Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="restaurant_owner">Restaurant Owner</option>
              </select>
            </label>

            {error ? <div className="form-message error">{error}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
