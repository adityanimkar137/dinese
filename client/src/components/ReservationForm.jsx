import { useState } from 'react';

// Used for booking (create), and for editing (customer page + admin page).
// tables      = the tables the user may choose from
// initialData = empty when booking, filled when editing
// showStatus  = admin only: lets you change the reservation status
function ReservationForm({ tables, initialData, onSubmit, onCancel, saving, submitLabel, showStatus }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerName: initialData?.customerName || '',
    customerPhone: initialData?.customerPhone || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    guests: initialData?.guests || 2,
    tableId: initialData?.tableId?._id || initialData?.tableId || '',
    status: initialData?.status || 'Confirmed',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) return setError('Please enter your name');
    if (!/^\d{10}$/.test(formData.customerPhone.trim())) return setError('Phone number must be 10 digits');
    if (!formData.date) return setError('Please choose a date');
    if (!formData.time) return setError('Please choose a time');
    if (!formData.tableId) return setError('Please select a table');

    const guests = Number(formData.guests);
    if (!guests || guests < 1) return setError('Guests must be at least 1');

    const selectedTable = tables.find((t) => t._id === formData.tableId);
    if (selectedTable && guests > selectedTable.capacity) {
      return setError(`Table ${selectedTable.tableNumber} seats only ${selectedTable.capacity} guests`);
    }

    setError('');
    onSubmit({ ...formData, customerPhone: formData.customerPhone.trim(), guests });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p className="error-msg">{error}</p>}
      <div className="form-row">
        <label>Customer name
          <input name="customerName" value={formData.customerName} onChange={handleChange} />
        </label>
        <label>Phone number
          <input name="customerPhone" value={formData.customerPhone} onChange={handleChange} placeholder="10 digits" maxLength="10" />
        </label>
      </div>
      <div className="form-row">
        <label>Date
          <input name="date" type="date" min={today} value={formData.date} onChange={handleChange} />
        </label>
        <label>Time
          <input name="time" type="time" value={formData.time} onChange={handleChange} />
        </label>
      </div>
      <div className="form-row">
        <label>Number of guests
          <input name="guests" type="number" min="1" value={formData.guests} onChange={handleChange} />
        </label>
        <label>Select table
          <select name="tableId" value={formData.tableId} onChange={handleChange}>
            <option value="">Choose a table</option>
            {tables.map((table) => (
              <option key={table._id} value={table._id}>
                Table {table.tableNumber} (seats {table.capacity})
              </option>
            ))}
          </select>
        </label>
      </div>
      {showStatus && (
        <label>Status
          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
            <option>Completed</option>
          </select>
        </label>
      )}
      {tables.length === 0 && <p className="muted">No tables are available right now.</p>}
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={saving || tables.length === 0}>
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ReservationForm;
