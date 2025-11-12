import React, { useEffect, useState } from 'react';
import { getSubscriptions } from '../api/subscriptionApi';
import './SubLock.css';

const SubLock: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [locked, setLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await getSubscriptions();
        const subscriptions = response.data;
        // Check for an active subscription (status === 'active')
        const hasActive = subscriptions.some(sub => sub.status === 'active');
        setLocked(!hasActive);
      } catch {
        setLocked(true); // Lock out on error
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="sublock-loading">
        <div className="sublock-spinner" />
        <span>Checking subscription...</span>
      </div>
    );
  }
  if (locked) {
    return (
      <div className="sublock-container">
        <div className="sublock-icon">🔒</div>
        <h2 className="sublock-title">Access Denied</h2>
        <p className="sublock-message">Your subscription is inactive.<br />Please subscribe to access features.</p>
        <button className="sublock-btn" onClick={() => window.location.href = '/subscribe'}>
          Subscribe Now
        </button>
      </div>
    );
  }
  return (<>{children}</>);
};

export default SubLock;
