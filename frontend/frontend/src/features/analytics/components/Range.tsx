import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getRange } from '../../../api/analyticsApi';
import type { RangeResponse } from '../../../api/analyticsApi';
import './Range.css';
import '../../mobileResponsive.css';
export function Range() {
  const [data, setData] = useState<RangeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRange('2025-11-01', '2025-11-07')
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load range data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="range"><span>Loading custom date range...</span></div>;
  if (error) return <div className="range"><span className="error">{error}</span></div>;
  if (!data) return <div className="range"><span>No range data available.</span></div>;

  const chartData = [
    { name: 'Sales', value: data.sales },
    { name: 'Orders', value: data.orders },
    { name: 'AOV', value: data.aov },
  ];

  return (
    <div className="range">
      <h2>Custom Date Range</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="range-summary">
        <div><strong>Sales:</strong> {data.sales}</div>
        <div><strong>Orders:</strong> {data.orders}</div>
        <div><strong>AOV:</strong> {data.aov}</div>
        <div><strong>Top Products:</strong> {data.topProducts.map(p => p.title).join(', ') || '-'}</div>
        {data.partial && (
          <div className="partial-warning">
            <small>Note: Data may be incomplete due to API limits.</small>
          </div>
        )}
      </div>
      <div className="range-info">
        <small>
          <strong>Tip:</strong> Analyze performance over any custom date range to understand trends and product popularity.<br />
          Adjust the range for deeper insights.
        </small>
      </div>
    </div>
  );
}
