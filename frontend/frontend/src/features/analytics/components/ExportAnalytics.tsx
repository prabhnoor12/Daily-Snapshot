
import React from 'react';
import '../../mobileResponsive.css';
import { exportAnalytics } from '../../../api/analyticsApi';
import type { ExportAnalyticsResponse } from '../../../api/analyticsApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ExportAnalytics() {
  const [data, setData] = React.useState<ExportAnalyticsResponse | string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    exportAnalytics()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to export analytics');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="export-analytics"><span>Exporting analytics...</span></div>;
  if (error) return <div className="export-analytics"><span className="error">{error}</span></div>;
  if (!data) return <div className="export-analytics"><span>No export data available.</span></div>;

  // Visualize exported data if possible
  let chart = null;
  if (typeof data === 'object' && data && data.data && Array.isArray(data.data)) {
    // Try to visualize as a simple bar chart if possible
    const chartData = data.data.map((row, idx) => ({ name: row.id || `Row ${idx + 1}`, value: row.totalPrice || 0 }));
    if (chartData.length > 0) {
      chart = (
        <div className="export-chart-container">
          <h3>Exported Data Chart</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  }
  return (
    <div className="export-analytics">
      <h2>Export Analytics</h2>
      {typeof data === 'string' ? (
        <div>
          <strong>CSV Export:</strong>
          <pre>{data}</pre>
        </div>
      ) : (
        <div>
          <strong>JSON Export:</strong>
          <pre>{JSON.stringify(data.data, null, 2)}</pre>
          {chart}
          {data.partial && (
            <div className="partial-warning">
              <small>Note: Data may be incomplete due to API limits.</small>
            </div>
          )}
        </div>
      )}
      <div className="export-info">
        <small>
          <strong>Tip:</strong> Use the export feature to download your analytics data for further analysis or reporting.<br/>
          JSON is best for developers and integrations; CSV is ideal for spreadsheets.
        </small>
      </div>
    </div>
  );
}
