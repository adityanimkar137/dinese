import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import Loading from '../components/Loading.jsx';

function RestaurantDetails() {
  const { id } = useParams(); // the :id part of /restaurants/:id
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const restaurantResponse = await api.get(`/restaurants/${id}`);
        setRestaurant(restaurantResponse.data.data);

        const tablesResponse = await api.get(`/tables?restaurantId=${id}&status=Available`);
        setTables(tablesResponse.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="page"><Loading text="Loading restaurant..." /></div>;
  if (error) return <div className="page"><p className="error-msg">{error}</p></div>;

  return (
    <div className="page">
      <Link to="/restaurants" className="link">Back to restaurants</Link>
      <div className="details-layout">
        {restaurant.image && !imageFailed ? (
          <img src={restaurant.image} alt={restaurant.name} className="details-img" onError={() => setImageFailed(true)} />
        ) : (
          <div className="details-img placeholder">{restaurant.name.charAt(0)}</div>
        )}
        <div>
          <h1>{restaurant.name}</h1>
          <p className="muted">{restaurant.cuisine} · {restaurant.location}</p>
          <p className="rating big">★ {restaurant.rating} / 5</p>
          <p>{restaurant.description}</p>
          <Link to={`/book/${restaurant._id}`} className="btn btn-primary">Book a Table</Link>
        </div>
      </div>

      <h2>Available tables</h2>
      {tables.length === 0 ? (
        <p className="empty">No tables are available right now.</p>
      ) : (
        <div className="table-chips">
          {tables.map((table) => (
            <div key={table._id} className="chip">
              <strong>Table {table.tableNumber}</strong>
              <span className="muted">Seats {table.capacity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantDetails;
