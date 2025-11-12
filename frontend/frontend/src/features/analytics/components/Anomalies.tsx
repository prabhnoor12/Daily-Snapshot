


import  { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getAnomalies } from '../../../api/analyticsApi';
import type { AnomaliesResponse } from '../../../api/analyticsApi';
import './Anomalies.css';
import '../../mobileResponsive.css';



export function Anomalies() {
  const [data, setData] = useState<AnomaliesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getAnomalies()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load anomalies data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="anomalies"><span>Loading anomalies...</span></div>;
  if (error) return <div className="anomalies"><span className="error">{error}</span></div>;
  if (!data || !data.anomalies.length) return <div className="anomalies"><span>No anomalies detected in the last 30 days.</span></div>;

  // Filter anomalies by search (date or sales)
  const filtered = data.anomalies.filter(a =>
    a.date.includes(search) || a.sales.toString().includes(search)
  );

  return (
    <div className="anomalies">
      <h2>Anomaly Detection</h2>
      <div className="anomaly-summary">
        <div><strong>Mean Sales:</strong> {data.mean}</div>
        <div><strong>Std Dev:</strong> {data.std}</div>
      </div>
      <div className="anomaly-search">
        <input
          type="text"
          placeholder="Search by date or sales..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid />
          <XAxis dataKey="date" name="Date" />
          <YAxis dataKey="sales" name="Sales" />
          <Tooltip />
          <Legend />
          <Scatter name="Anomalies" data={filtered} fill="#ff7300" />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="anomalies-info">
        <small>
          <strong>Tip:</strong> Anomalies highlight unusual sales activity.<br/>
          Use this chart to quickly spot outliers in your store's performance.
        </small>
      </div>
      <div className="anomaly-info">
        <small>
          <strong>What is an anomaly?</strong> An anomaly is a sales value with a z-score &ge; 2 or &le; -2, indicating it is statistically unusual compared to the last 30 days.<br/>
          Use the search box to quickly find anomalies by date or sales value.
        </small>
      </div>
    </div>
  );
}

