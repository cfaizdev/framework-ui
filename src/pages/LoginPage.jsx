import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo__icon">⚡</div>
          <h1 className="login-logo__title">Dynamic Framework</h1>
          <p className="login-logo__sub">Admin Portal</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" id="login-error">
            <span className="login-error__icon">⚠</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" id="login-form">
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mycompany.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-footer">
          Secure, multi-tenant administration platform
        </p>
      </div>
    </div>
  );
}
