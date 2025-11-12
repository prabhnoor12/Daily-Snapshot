import React, { useState } from 'react';
import { login } from '../../api/authApi';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShopName(e.target.value);
  };

  const startOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Call backend to start OAuth process
      const response = await login({ email: `${shopName}@shopify.com`, password: 'oauth' });
      // Expect backend to return either oauthUrl or an error message
      if (response.data && response.data.oauthUrl) {
        window.location.href = response.data.oauthUrl;
      } else if (response.data && response.data.message) {
        setError(response.data.message);
      } else {
        setError('Failed to get OAuth URL.');
      }
    } catch (err: unknown) {
      // Handle axios error shape and backend validation errors
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: unknown }).response === 'object' &&
        (err as { response?: { data?: { message?: string; code?: number } } }).response &&
        'data' in (err as { response: { data?: unknown } }).response
      ) {
        const response = (err as { response: { data?: { message?: string; code?: number } } }).response;
        // Show backend error message, including validation errors
        if (response.data?.message) {
          setError(response.data.message);
        } else if (response.data?.code === 400) {
          setError('Invalid shop domain. Please enter a valid Shopify shop name.');
        } else {
          setError('Authentication failed.');
        }
      } else if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login with Shopify</h2>
        <form onSubmit={startOAuth} className="auth-form">
          <input
            type="text"
            placeholder="Enter your Shopify shop name"
            value={shopName}
            onChange={handleShopNameChange}
            className="shop-input"
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Redirecting...' : 'Login with Shopify'}
          </button>
        </form>
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
};

export default AuthPage;
