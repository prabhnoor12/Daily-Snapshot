
import React from 'react';
import '../../mobileResponsive.css';
import { getOrderStatus } from '../../../api/analyticsApi';
import type { OrderStatusResponse } from '../../../api/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function OrderStatus() {
  const [data, setData] = React.useState<OrderStatusResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getOrderStatus()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load order status data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="order-status"><span>Loading order status breakdown...</span></div>;
  if (error) return <div className="order-status"><span className="error">{error}</span></div>;
  if (!data) return <div className="order-status"><span>No order status data available.</span></div>;

  // Prepare chart data
  const financialData = Object.entries(data.financial).map(([name, value]) => ({ name, value }));
  const fulfillmentData = Object.entries(data.fulfillment).map(([name, value]) => ({ name, value }));
  return (
    <div className="order-status">
      <h2>Order Status Breakdown</h2>
      <div className="order-status-charts-row">
        <div className="order-status-chart-col">
          <h3>Financial Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={financialData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="order-status-chart-col">
          <h3>Fulfillment Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fulfillmentData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="order-status-summary">
        <div><strong>Financial Status:</strong></div>
        <ul>
          {Object.entries(data.financial).map(([status, count]) => (
            <li key={status}>{status}: {count}</li>
          ))}
        </ul>
        <div><strong>Fulfillment Status:</strong></div>
        <ul>
          {Object.entries(data.fulfillment).map(([status, count]) => (
            <li key={status}>{status}: {count}</li>
          ))}
        </ul>
        {data.partial && (
          <div className="partial-warning">
            <small>Note: Data may be incomplete due to API limits.</small>
          </div>
        )}
      </div>
      <div className="order-status-info">
        <small>
          <strong>Tip:</strong> Track financial and fulfillment status to monitor order health and processing.<br/>
          Use this breakdown to spot issues and optimize operations.
        </small>
      </div>
    </div>
  );
}
