import { useState } from 'react';

// Reusable form for adding AND editing a table.
function TableForm({ restaurants, initialData, onSubmit, onCancel, saving }) {
  const [formData, setFormData] = useState({
    // After populate(), restaurantId is an object, so we read its _id
    restaurantId: initialData?.restaurantId?._id || initialData?.restaurantId || '',
    tableNumber: initialData?.tableNumber || '',
    capacity: initialData?.capacity || '',
    status: initialData?.status || 'Available',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.restaurantId || !formData.tableNumber || !formData.capacity) {
      setError('Restaurant, table number and capacity are required');
      return;
    }
    if (Number(formData.capacity) <= 0 || Number(formData.tableNumber) <= 0) {
      setError('Table number and capacity must be greater than 0');
      return;
    }
    setError('');
    onSubmit({
      restaurantId: formData.restaurantId,
      tableNumber: Number(formData.tableNumber),
      capacity: Number(formData.capacity),
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p className="error-msg">{error}</p>}
      <label>Restaurant
        <select name="restaurantId" value={formData.restaurantId} onChange={handleChange}>
          <option value="">Select a restaurant</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>Table number
          <input name="tableNumber" type="number" min="1" value={formData.tableNumber} onChange={handleChange} />
        </label>
        <label>Capacity (seats)
          <input name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} />
        </label>
      </div>
      <label>Status
        <select name="status" value={formData.status} onChange={handleChange}>
          <option>Available</option>
          <option>Reserved</option>
          <option>Maintenance</option>
        </select>
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : initialData ? 'Save changes' : 'Add table'}
        </button>
      </div>
    </form>
  );
}

export default TableForm;
