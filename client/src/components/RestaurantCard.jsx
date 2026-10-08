import { useState } from 'react';
import { Link } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
  // If the image link is empty or broken we show a plain coloured block with the first letter
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = restaurant.image && !imageFailed;

  return (
    <div className="card restaurant-card">
      {showImage ? (
        <img src={restaurant.image} alt={restaurant.name} className="card-img" onError={() => setImageFailed(true)} />
      ) : (
        <div className="card-img placeholder">{restaurant.name.charAt(0)}</div>
      )}
      <div className="card-body">
        <div className="card-title-row">
          <h3>{restaurant.name}</h3>
          <span className="rating">★ {restaurant.rating}</span>
        </div>
        <p className="muted">{restaurant.cuisine} · {restaurant.location}</p>
        <p className="card-desc">{restaurant.description}</p>
        <div className="card-actions">
          <Link to={`/restaurants/${restaurant._id}`} className="btn btn-outline">View details</Link>
          <Link to={`/book/${restaurant._id}`} className="btn btn-primary">Book a Table</Link>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
