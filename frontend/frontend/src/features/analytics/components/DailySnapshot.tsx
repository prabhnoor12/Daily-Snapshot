
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import '../../mobileResponsive.css';
import { getDailySnapshot } from '../../../api/analyticsApi';
import type { SnapshotResponse } from '../../../api/analyticsApi';


export function DailySnapshot() {
  const [data, setData] = React.useState<SnapshotResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getDailySnapshot()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load daily snapshot');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="daily-snapshot"><span>Loading daily snapshot...</span></div>;
  if (error) return <div className="daily-snapshot"><span className="error">{error}</span></div>;
  if (!data) return <div className="daily-snapshot"><span>No daily snapshot available.</span></div>;

  const chartData = [
    { name: 'Sales', value: data.sales },
    { name: 'Orders', value: data.orders },
    { name: 'AOV', value: data.aov },
  ];

  return (
    <div className="analytics-component">
      <h3 className="analytics-component-title">Daily Snapshot</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <div className="snapshot-summary">
        {data.topProduct && (
          <div><strong>Top Product:</strong> {data.topProduct.title} (${data.topProduct.revenue})</div>
        )}
        {typeof data.liveVisitors === 'number' && (
          <div><strong>Live Visitors:</strong> {data.liveVisitors}</div>
        )}
        {data.partial && (
          <div className="partial-warning">
            <small>Note: Data may be incomplete due to API limits.</small>
          </div>
        )}
      </div>
      <div className="snapshot-info">
        <small>
          <strong>Tip:</strong> Use this snapshot to quickly assess today's performance and trends.<br/>
          Metrics are updated in real time.
        </small>
      </div>
    </div>
  );
}
