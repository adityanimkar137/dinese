import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin">
      <aside className="sidebar">
        <h3>Admin</h3>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/restaurants">Restaurants</NavLink>
        <NavLink to="/admin/tables">Tables</NavLink>
        <NavLink to="/admin/reservations">Reservations</NavLink>
      </aside>
      <section className="admin-content">
        {/* The matching child route (Dashboard, AdminRestaurants, ...) is shown here */}
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
