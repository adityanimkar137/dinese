import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <Loading text="Loading statistics..." />;
  if (error) return <p className="error-msg">{error}</p>;

  const cards = [
    { label: 'Total Restaurants', value: stats.totalRestaurants },
    { label: 'Total Tables', value: stats.totalTables },
    { label: 'Available Tables', value: stats.availableTables },
    { label: 'Total Reservations', value: stats.totalReservations },
    { label: 'Pending Reservations', value: stats.pendingReservations },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="card stat-card">
            <p className="stat-value">{card.value}</p>
            <p className="muted">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
