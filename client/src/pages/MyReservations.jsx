import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import ReservationCard from '../components/ReservationCard.jsx';
import ReservationForm from '../components/ReservationForm.jsx';
import Modal from '../components/Modal.jsx';
import Loading from '../components/Loading.jsx';

function MyReservations() {
  // Start with the phone number saved from the last booking (if any)
  const [phone, setPhone] = useState(localStorage.getItem('dineease_phone') || '');
  const [reservations, setReservations] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [editing, setEditing] = useState(null); // the reservation being edited
  const [editTables, setEditTables] = useState([]); // tables the user can move to

  // READ: get reservations by phone number
  const loadReservations = async (phoneNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/reservations?customerPhone=${phoneNumber}`);
      setReservations(response.data.data);
      setSearched(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone) loadReservations(phone);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Enter a 10 digit phone number');
      return;
    }
    localStorage.setItem('dineease_phone', phone.trim());
    setMessage('');
    loadReservations(phone.trim());
  };

  // UPDATE (status only): cancel a booking
  const handleCancel = async (reservation) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.put(`/reservations/${reservation._id}`, { status: 'Cancelled' });
      setMessage('Reservation cancelled');
      loadReservations(phone);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // DELETE
  const handleDelete = async (reservation) => {
    if (!window.confirm('Delete this reservation permanently?')) return;
    try {
      await api.delete(`/reservations/${reservation._id}`);
      setMessage('Reservation deleted');
      loadReservations(phone);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Open the edit popup: load the tables of that restaurant
  const handleEditClick = async (reservation) => {
    setError('');
    try {
      const response = await api.get(`/tables?restaurantId=${reservation.restaurantId._id}`);
      // allow Available tables, plus the table this booking already uses
      const usableTables = response.data.data.filter(
        (table) => table.status === 'Available' || table._id === reservation.tableId._id
      );
      setEditTables(usableTables);
      setEditing(reservation);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // UPDATE (full): save the edited reservation
  const handleEditSubmit = async (formValues) => {
    setSaving(true);
    try {
      await api.put(`/reservations/${editing._id}`, formValues);
      setEditing(null);
      setMessage('Reservation updated');
      loadReservations(phone);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1>My reservations</h1>
      <p className="muted">Enter the phone number you used when booking.</p>

      <form className="filters" onSubmit={handleSearch}>
        <input
          placeholder="10 digit phone number"
          value={phone}
          maxLength="10"
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Find my bookings</button>
      </form>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
      {loading && <Loading text="Loading reservations..." />}
      {!loading && searched && reservations.length === 0 && (
        <p className="empty">No reservations found for this phone number.</p>
      )}

      <div className="grid">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation._id}
            reservation={reservation}
            onEdit={handleEditClick}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editing && (
        <Modal title="Edit reservation" onClose={() => setEditing(null)}>
          <ReservationForm
            tables={editTables}
            initialData={editing}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(null)}
            saving={saving}
            submitLabel="Save changes"
          />
        </Modal>
      )}
    </div>
  );
}

export default MyReservations;
