
import React from 'react';
import '../../mobileResponsive.css';
import { getDayOverDay } from '../../../api/analyticsApi';
import type { CompareResponse } from '../../../api/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function DayOverDay() {
  const [data, setData] = React.useState<CompareResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getDayOverDay()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load day-over-day comparison');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="day-over-day"><span>Loading day-over-day comparison...</span></div>;
  if (error) return <div className="day-over-day"><span className="error">{error}</span></div>;
  if (!data) return <div className="day-over-day"><span>No day-over-day data available.</span></div>;

  // Prepare chart data
  const chartData = [
    { name: 'Today', sales: data.sales?.today ?? 0, orders: data.orders?.today ?? 0, aov: data.aov?.today ?? 0 },
    { name: 'Yesterday', sales: data.sales?.yesterday ?? 0, orders: data.orders?.yesterday ?? 0, aov: data.aov?.yesterday ?? 0 },
  ];

  return (
    <div className="day-over-day">
      <h2>Day Over Day Comparison</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" name="Sales" />
          <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
          <Bar dataKey="aov" fill="#ffc658" name="AOV" />
        </BarChart>
      </ResponsiveContainer>
      <div className="comparison-summary">
        <div><strong>Sales:</strong> Today: {data.sales?.today ?? 'N/A'} | Yesterday: {data.sales?.yesterday ?? 'N/A'} | Change: {data.sales?.change ?? 'N/A'}%</div>
        <div><strong>Orders:</strong> Today: {data.orders?.today ?? 'N/A'} | Yesterday: {data.orders?.yesterday ?? 'N/A'} | Change: {data.orders?.change ?? 'N/A'}%</div>
        <div><strong>AOV:</strong> Today: {data.aov?.today ?? 'N/A'} | Yesterday: {data.aov?.yesterday ?? 'N/A'} | Change: {data.aov?.change ?? 'N/A'}%</div>
        {data.partial && (
          <div className="partial-warning">
            <small>Note: Data may be incomplete due to API limits.</small>
          </div>
        )}
      </div>
      <div className="comparison-info">
        <small>
          <strong>Tip:</strong> Use this comparison to spot trends and changes in your store's performance from one day to the next.<br />
          Percentage change is calculated relative to yesterday's value.
        </small>
      </div>
    </div>
  );
}
