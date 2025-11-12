
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import '../../mobileResponsive.css';
import { getTrend } from '../../../api/analyticsApi';
import type { TrendDay } from '../../../api/analyticsApi';


export function Trend() {
  const [data, setData] = React.useState<TrendDay[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getTrend()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load trend data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="trend"><span>Loading 7-day trend...</span></div>;
  if (error) return <div className="trend"><span className="error">{error}</span></div>;
  if (!data) return <div className="trend"><span>No trend data available.</span></div>;
  // Defensive: ensure we have an array before mapping
  if (!Array.isArray(data) || data.length === 0) {

    console.error('Trend component expected an array but received:', data);
    return <div className="trend"><span>No trend data available.</span></div>;
  }

  return (
    <div className="analytics-component">
      <h3 className="analytics-component-title">7-Day Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
          <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
          <Line type="monotone" dataKey="aov" stroke="#ffc658" name="AOV" />
        </LineChart>
      </ResponsiveContainer>
      <div className="trend-info">
        <small>
          <strong>Tip:</strong> Use the 7-day trend to spot patterns and seasonality in your store's performance.<br/>
          Metrics are shown for each day.
        </small>
      </div>
    </div>
  );
}
