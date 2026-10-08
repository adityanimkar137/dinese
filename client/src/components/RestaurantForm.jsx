import { useState } from 'react';

// Reusable form for adding AND editing a restaurant.
// initialData is empty when adding, and filled when editing.
function RestaurantForm({ initialData, onSubmit, onCancel, saving }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    location: initialData?.location || '',
    cuisine: initialData?.cuisine || '',
    rating: initialData?.rating ?? 4,
    description: initialData?.description || '',
    image: initialData?.image || '',
  });
  const [error, setError] = useState('');

  // One handler for all inputs: the input's "name" attribute tells us which field changed
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    if (!formData.name.trim() || !formData.location.trim() || !formData.cuisine.trim() || !formData.description.trim()) {
      setError('Name, location, cuisine and description are required');
      return;
    }
    const rating = Number(formData.rating);
    if (rating < 0 || rating > 5) {
      setError('Rating must be between 0 and 5');
      return;
    }
    setError('');
    onSubmit({ ...formData, rating });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p className="error-msg">{error}</p>}
      <label>Name
        <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. The Green Leaf" />
      </label>
      <label>Location
        <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bandra West, Mumbai" />
      </label>
      <div className="form-row">
        <label>Cuisine
          <input name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="e.g. Italian" />
        </label>
        <label>Rating (0-5)
          <input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} />
        </label>
      </div>
      <label>Image link (optional)
        <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
      </label>
      <label>Description
        <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : initialData ? 'Save changes' : 'Add restaurant'}
        </button>
      </div>
    </form>
  );
}

export default RestaurantForm;
