import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import Loading from '../components/Loading.jsx';

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const navigate = useNavigate();

  // useEffect with [] runs once, when the page first loads
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

  // Unique cuisines for the dropdown
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))];

  const handleSearch = (e) => {
    e.preventDefault();
    // Send the search to the restaurants page through the URL: /restaurants?search=pizza&cuisine=Italian
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (cuisine) params.set('cuisine', cuisine);
    navigate(`/restaurants?${params.toString()}`);
  };

  const featured = restaurants.slice(0, 3);

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1>Your table is waiting.</h1>
            <p>Pick a restaurant, choose a time, and book in under a minute. No calls, no queues.</p>
            <form className="search-box" onSubmit={handleSearch}>
              <input
                placeholder="Search by restaurant name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <option value="">All cuisines</option>
                {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn btn-accent" type="submit">Find a table</button>
            </form>
          </div>
          {!heroImageFailed && (
            <img
              className="hero-img"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80"
              alt="Restaurant dining room"
              onError={() => setHeroImageFailed(true)}
            />
          )}
        </div>
      </section>

      <section className="page">
        <div className="section-head">
          <h2>Featured restaurants</h2>
          <Link to="/restaurants" className="link">See all restaurants</Link>
        </div>
        {loading && <Loading text="Loading restaurants..." />}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && featured.length === 0 && (
          <p className="empty">No restaurants yet. Add one from the admin dashboard.</p>
        )}
        <div className="grid">
          {featured.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
