import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api.js';
import ReservationForm from '../../components/ReservationForm.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import Loading from '../../components/Loading.jsx';

const STATUS_FILTERS = ['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'];

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [editTables, setEditTables] = useState([]);

  // READ with an optional filter: /reservations?status=Pending
  const loadReservations = async (filter) => {
    try {
      const url = filter === 'All' ? '/reservations' : `/reservations?status=${filter}`;
      const response = await api.get(url);
      setReservations(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Runs on first load AND every time statusFilter changes
  useEffect(() => {
    loadReservations(statusFilter);
  }, [statusFilter]);

  const handleEditClick = async (reservation) => {
    setError('');
    try {
      const response = await api.get(`/tables?restaurantId=${reservation.restaurantId._id}`);
      // Admin can pick any table except those under maintenance
      setEditTables(response.data.data.filter((t) => t.status !== 'Maintenance'));
      setEditing(reservation);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditSubmit = async (formValues) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/reservations/${editing._id}`, formValues);
      setEditing(null);
      setMessage('Reservation updated');
      loadReservations(statusFilter);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reservation) => {
    if (!window.confirm(`Delete the reservation for ${reservation.customerName}?`)) return;
    try {
      await api.delete(`/reservations/${reservation._id}`);
      setMessage('Reservation deleted');
      loadReservations(statusFilter);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1>Reservations</h1>

      <div className="tabs">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            className={statusFilter === status ? 'tab active' : 'tab'}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
      {loading && <Loading />}
      {!loading && reservations.length === 0 && <p className="empty">No reservations found.</p>}

      {reservations.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th><th>Restaurant</th><th>Table</th><th>Date</th>
                <th>Time</th><th>Guests</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>{reservation.customerName}<br /><span className="muted">{reservation.customerPhone}</span></td>
                  <td>{reservation.restaurantId ? reservation.restaurantId.name : '-'}</td>
                  <td>{reservation.tableId ? reservation.tableId.tableNumber : '-'}</td>
                  <td>{reservation.date}</td>
                  <td>{reservation.time}</td>
                  <td>{reservation.guests}</td>
                  <td><StatusBadge status={reservation.status} /></td>
                  <td className="actions">
                    <button className="btn btn-small btn-outline" onClick={() => handleEditClick(reservation)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(reservation)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title="Edit reservation" onClose={() => setEditing(null)}>
          <ReservationForm
            tables={editTables}
            initialData={editing}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(null)}
            saving={saving}
            submitLabel="Save changes"
            showStatus={true}
          />
        </Modal>
      )}
    </div>
  );
}

export default AdminReservations;
