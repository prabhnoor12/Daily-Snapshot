

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../mobileResponsive.css';
import { getCustomerInsights } from '../../../api/analyticsApi';
import type { CustomerInsightsResponse } from '../../../api/analyticsApi';

export function CustomerInsights() {
  const [data, setData] = React.useState<CustomerInsightsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getCustomerInsights()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load customer insights');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="customer-insights"><span>Loading customer insights...</span></div>;
  if (error) return <div className="customer-insights"><span className="error">{error}</span></div>;
  if (!data) return <div className="customer-insights"><span>No customer insights available.</span></div>;

  const pieData = [
    { name: 'New Customers', value: data.newCustomers },
    { name: 'Returning Customers', value: data.returningCustomers },
  ];
  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div className="customer-insights">
      <h2>Customer Insights</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="insights-info">
        <small>
          <strong>Tip:</strong> Track your customer acquisition and retention.<br/>
          Use this chart to see the balance between new and returning customers.
        </small>
      </div>
    </div>
  );
}
