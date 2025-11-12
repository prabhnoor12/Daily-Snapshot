
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../mobileResponsive.css';
import { getForecast } from '../../../api/analyticsApi';
import type { ForecastResponse } from '../../../api/analyticsApi';


export function Forecast() {
  const [data, setData] = React.useState<ForecastResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getForecast()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load forecast data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="forecast"><span>Loading forecast...</span></div>;
  if (error) return <div className="forecast"><span className="error">{error}</span></div>;
  if (!data || !data.forecast.length) return <div className="forecast"><span>No forecast data available.</span></div>;

  return (
    <div className="forecast">
      <h2>Forecast</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data.forecast} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predictedSales" stroke="#8884d8" name="Predicted Sales" />
        </LineChart>
      </ResponsiveContainer>
      <table className="forecast-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Predicted Sales</th>
          </tr>
        </thead>
        <tbody>
          {data.forecast.map(f => (
            <tr key={f.date}>
              <td>{f.date}</td>
              <td>{f.predictedSales}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="forecast-info">
        <small>
          <strong>Tip:</strong> Forecasts are based on a 7-day moving average over the last 30 days.<br/>
          Use this to anticipate sales and plan inventory or marketing.
        </small>
      </div>
    </div>
  );
}
