import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api.js';
import RestaurantForm from '../../components/RestaurantForm.jsx';
import Modal from '../../components/Modal.jsx';
import Loading from '../../components/Loading.jsx';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding a new one

  // READ
  const loadRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditForm = (restaurant) => {
    setEditing(restaurant);
    setShowForm(true);
  };

  // CREATE or UPDATE, depending on `editing`
  const handleSubmit = async (formValues) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/restaurants/${editing._id}`, formValues);
        setMessage('Restaurant updated');
      } else {
        await api.post('/restaurants', formValues);
        setMessage('Restaurant added');
      }
      setShowForm(false);
      loadRestaurants(); // reload the list so the table shows the change
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (restaurant) => {
    const ok = window.confirm(`Delete "${restaurant.name}"? Its tables and reservations will also be deleted.`);
    if (!ok) return;
    try {
      await api.delete(`/restaurants/${restaurant._id}`);
      setMessage('Restaurant deleted');
      loadRestaurants();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h1>Restaurants</h1>
        <button className="btn btn-primary" onClick={openAddForm}>+ Add Restaurant</button>
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
      {loading && <Loading />}
      {!loading && restaurants.length === 0 && <p className="empty">No restaurants yet. Add your first one.</p>}

      {restaurants.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Location</th><th>Cuisine</th><th>Rating</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.location}</td>
                  <td>{restaurant.cuisine}</td>
                  <td>★ {restaurant.rating}</td>
                  <td className="actions">
                    <button className="btn btn-small btn-outline" onClick={() => openEditForm(restaurant)}>Edit</button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDelete(restaurant)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit restaurant' : 'Add restaurant'} onClose={() => setShowForm(false)}>
          <RestaurantForm
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}

export default AdminRestaurants;
