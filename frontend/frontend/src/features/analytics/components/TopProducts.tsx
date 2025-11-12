
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import '../../mobileResponsive.css';
import { getTopProducts } from '../../../api/analyticsApi';
import type { TopProductsResponse } from '../../../api/analyticsApi';


export function TopProducts() {
  const [data, setData] = React.useState<TopProductsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getTopProducts(5)
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load top products');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="top-products"><span>Loading top products...</span></div>;
  if (error) return <div className="top-products"><span className="error">{error}</span></div>;
  if (!data || !data.topProducts.length) return <div className="top-products"><span>No top products data available.</span></div>;

  return (
    <div className="top-products">
      <h2>Top Products</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data.topProducts} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
      <div className="top-products-info">
        <small>
          <strong>Tip:</strong> See which products are driving the most revenue today.<br/>
          Use this insight to optimize inventory and marketing.
        </small>
      </div>
    </div>
  );
}
