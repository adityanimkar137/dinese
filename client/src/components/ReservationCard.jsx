import StatusBadge from './StatusBadge.jsx';

// One reservation shown as a card on the "My Reservations" page
function ReservationCard({ reservation, onEdit, onCancel, onDelete }) {
  const isActive = reservation.status === 'Confirmed' || reservation.status === 'Pending';

  return (
    <div className="card reservation-card">
      <div className="card-title-row">
        <h3>{reservation.restaurantId?.name || 'Restaurant removed'}</h3>
        <StatusBadge status={reservation.status} />
      </div>
      <dl className="details">
        <div><dt>Customer</dt><dd>{reservation.customerName}</dd></div>
        <div><dt>Table</dt><dd>{reservation.tableId ? `Table ${reservation.tableId.tableNumber}` : '-'}</dd></div>
        <div><dt>Date</dt><dd>{reservation.date}</dd></div>
        <div><dt>Time</dt><dd>{reservation.time}</dd></div>
        <div><dt>Guests</dt><dd>{reservation.guests}</dd></div>
      </dl>
      <div className="card-actions">
        {isActive && <button className="btn btn-outline" onClick={() => onEdit(reservation)}>Edit</button>}
        {isActive && <button className="btn btn-outline" onClick={() => onCancel(reservation)}>Cancel booking</button>}
        <button className="btn btn-danger" onClick={() => onDelete(reservation)}>Delete</button>
      </div>
    </div>
  );
}

export default ReservationCard;
