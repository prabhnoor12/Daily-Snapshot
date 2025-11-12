import React, { useEffect, useState } from 'react';
import useAuth from '../../../components/useAuth';
import axios from 'axios';
import { getUserById } from '../../../api/userApi';
import './User.css';
interface Subscription {
  id: number;
  planName: string;
  status: string;
  cancelledAt?: string | null;
}

const User: React.FC = () => {
  const { user, loading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?.shopId) return;
      try {
        const res = await axios.get(`/api/subscriptions?shop=${user.shopId}`);
        setSubscriptions(res.data?.data || []);
      } catch {
        setError('Could not fetch subscriptions');
      }
    };
    fetchSubscriptions();
  }, [user?.shopId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;
      try {
        const res = await getUserById(user.id);
        setUserDetails(res.data);
      } catch {
        setUserDetails(null);
      }
    };
    fetchUserDetails();
  }, [user?.id]);

  if (loading) return <div>Loading user info...</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div className="user-details-card">
      <h2 className="user-title">User Details</h2>
      <div className="user-info"><span className="user-label">Shop:</span> {user.shopId}</div>
      <div className="user-info"><span className="user-label">Name:</span> {userDetails?.name || 'N/A'}</div>
      <div className="user-info"><span className="user-label">Email:</span> {userDetails?.email || user.email || 'N/A'}</div>
      <div className="user-info"><span className="user-label">User ID:</span> {user.id}</div>
      <h3 className="user-sub-title">Subscriptions</h3>
      {subscriptions.length === 0 ? (
        <div className="user-no-sub">No subscriptions found.</div>
      ) : (
        <ul className="user-sub-list">
          {subscriptions.map(sub => (
            <li key={sub.id} className={`user-sub-item${sub.status === 'active' ? ' active' : ''}`}>
              <strong>{sub.planName}</strong> - Status: {sub.status}
              {sub.cancelledAt ? ' (Cancelled)' : ''}
            </li>
          ))}
        </ul>
      )}
      {error && <div className="user-error">{error}</div>}
    </div>
  );
};

export default User;
