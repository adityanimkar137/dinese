import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import Loading from '../components/Loading.jsx';

function Restaurants() {
  const [searchParams] = useSearchParams(); // reads ?search=...&cuisine=... from the URL
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '');

  useEffect(() => {
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
    loadRestaurants();
  }, []);

  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))];

  // Filtering happens in the browser, on the list we already loaded
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesName = restaurant.name.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine = cuisine === '' || restaurant.cuisine === cuisine;
    return matchesName && matchesCuisine;
  });

  return (
    <div className="page">
      <h1>Restaurants</h1>
      <div className="filters">
        <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading && <Loading text="Loading restaurants..." />}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !error && filteredRestaurants.length === 0 && (
        <p className="empty">No restaurants match your search.</p>
      )}
      <div className="grid">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}

export default Restaurants;
