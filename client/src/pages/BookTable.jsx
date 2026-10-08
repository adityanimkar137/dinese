import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import ReservationForm from '../components/ReservationForm.jsx';
import Loading from '../components/Loading.jsx';

function BookTable() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // holds the new reservation after a successful booking

  // Loads the restaurant and ONLY the tables with status "Available"
  const loadTables = async () => {
    const response = await api.get(`/tables?restaurantId=${restaurantId}&status=Available`);
    setTables(response.data.data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const restaurantResponse = await api.get(`/restaurants/${restaurantId}`);
        setRestaurant(restaurantResponse.data.data);
        await loadTables();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  const handleBooking = async (formValues) => {
    setSaving(true);
    setError('');
    try {
      const response = await api.post('/reservations', {
        restaurantId: restaurantId,
        tableId: formValues.tableId,
        customerName: formValues.customerName,
        customerPhone: formValues.customerPhone,
        date: formValues.date,
        time: formValues.time,
        guests: formValues.guests,
      });
      // Remember the phone number so "My Reservations" can fill it in for us
      localStorage.setItem('dineease_phone', formValues.customerPhone);
      setSuccess(response.data.data);
      await loadTables(); // the booked table disappears from the list
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><Loading text="Loading..." /></div>;
  if (!restaurant) return <div className="page"><p className="error-msg">{error || 'Restaurant not found'}</p></div>;

  return (
    <div className="page narrow">
      <Link to={`/restaurants/${restaurantId}`} className="link">Back to {restaurant.name}</Link>
      <h1>Book a table at {restaurant.name}</h1>
      <p className="muted">{restaurant.cuisine} · {restaurant.location}</p>

      {success ? (
        <div className="success-box">
          <h2>You're booked!</h2>
          <p>
            Table {success.tableId.tableNumber} at {success.restaurantId.name} on {success.date} at {success.time} for{' '}
            {success.guests} guests.
          </p>
          <div className="card-actions">
            <Link to="/my-reservations" className="btn btn-primary">View my reservations</Link>
            <button className="btn btn-outline" onClick={() => setSuccess(null)}>Book another table</button>
          </div>
        </div>
      ) : (
        <div className="card form-card">
          {error && <p className="error-msg">{error}</p>}
          <ReservationForm tables={tables} onSubmit={handleBooking} saving={saving} submitLabel="Confirm booking" />
        </div>
      )}
    </div>
  );
}

export default BookTable;
