import React, { useState, useEffect } from 'react';
import './SubscriptionPage.css';
import { createSubscription, getSubscriptions, cancelSubscription } from '../../../api/subscriptionApi';
import type { SubscriptionPayload, Subscription } from '../../../api/subscriptionApi';

const SubscriptionPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getSubscriptions()
            .then(res => setSubscriptions(res.data))
            .catch(() => setError('Could not fetch subscription status.'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubscribe = async (plan = 'Pro') => {
        setActionLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const payload: SubscriptionPayload = { plan, userId: '' };
            await createSubscription(payload);
            setSuccess(`Subscribed to ${plan}.`);
            getSubscriptions()
                .then(r => setSubscriptions(r.data));
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                typeof (err as { response?: unknown }).response === 'object'
            ) {
                const response = (err as { response?: { data?: { message?: string } } }).response;
                setError(response?.data?.message || 'Failed to subscribe.');
            } else {
                setError('Failed to subscribe.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (chargeId: string) => {
        setActionLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await cancelSubscription(chargeId);
            setSuccess('Subscription cancelled.');
            getSubscriptions()
                .then(r => setSubscriptions(r.data));
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                typeof (err as { response?: unknown }).response === 'object'
            ) {
                const response = (err as { response?: { data?: { message?: string } } }).response;
                setError(response?.data?.message || 'Failed to cancel subscription.');
            } else {
                setError('Failed to cancel subscription.');
            }
        } finally {
            setActionLoading(false);
        }
    };



    return (
        <div className="subscription-page">
            <h1 className="title">Upgrade your store with Daily Snapshot</h1>
            <p className="subtitle">Get concise daily sales insights, automated snapshots, and actionable alerts delivered straight to your inbox.</p>

            {(loading || actionLoading) && (
                <div className="overlay-spinner">
                    <span className="spinner" />
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="cta-compact" role="region" aria-label="Subscription call to action">
                <div className="cta-info">
                    <div className="cta-plan">Pro Plan</div>
                    <div className="cta-price">$20 <span className="cta-period">/ month</span></div>
                    <div className="trust-badges">Starts with a 14-day free trial • Cancel anytime</div>
                </div>
                <div>
                    {Array.isArray(subscriptions) && subscriptions.length > 0 && subscriptions[0] && subscriptions[0].status === 'active' ? (
                        <>
                            <div className="current-status">You are subscribed to the Pro Plan.</div>
                            <button className="cancel-btn" onClick={() => handleCancel(subscriptions[0].id)} disabled={actionLoading}>
                                {actionLoading ? <span className="spinner" /> : 'Cancel Subscription'}
                            </button>
                        </>
                    ) : (
                        <button className="subscribe-btn" onClick={() => handleSubscribe('Pro')} disabled={actionLoading || loading}>
                            {actionLoading ? <span className="spinner" /> : 'Start 14-day free trial'}
                        </button>
                    )}
                </div>
            </div>

            <div className="current-subscriptions">
                <h2>Benefits to your store</h2>
                <ul className="features-list">
                    <li className="subscription-item"><span className="feature-icon">📈</span>Daily sales snapshot: sales, orders, AOV, top product</li>
                    <li className="subscription-item"><span className="feature-icon">📊</span>7-day sales trend</li>
                    <li className="subscription-item"><span className="feature-icon">🔄</span>Day-over-day sales, orders, and AOV comparison</li>
                    <li className="subscription-item"><span className="feature-icon">📅</span>Custom date range analytics</li>
                    <li className="subscription-item"><span className="feature-icon">🏆</span>Top products by revenue</li>
                    <li className="subscription-item"><span className="feature-icon">📦</span>Order status breakdown</li>
                    <li className="subscription-item"><span className="feature-icon">👥</span>Customer insights: new vs. returning</li>
                    <li className="subscription-item"><span className="feature-icon">📤</span>Export analytics (CSV/JSON)</li>
                    <li className="subscription-item"><span className="feature-icon">🔮</span>Sales forecast (future predictions)</li>
                    <li className="subscription-item"><span className="feature-icon">⚠️</span>Anomaly detection (outlier sales/events)</li>
                </ul>
            </div>
        </div>
    );
};

export default SubscriptionPage;
