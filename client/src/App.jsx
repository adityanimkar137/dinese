import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Restaurants from './pages/Restaurants.jsx';
import RestaurantDetails from './pages/RestaurantDetails.jsx';
import BookTable from './pages/BookTable.jsx';
import MyReservations from './pages/MyReservations.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminRestaurants from './pages/admin/AdminRestaurants.jsx';
import AdminTables from './pages/admin/AdminTables.jsx';
import AdminReservations from './pages/admin/AdminReservations.jsx';

// Each <Route> maps a URL to a page component.
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/book/:restaurantId" element={<BookTable />} />
          <Route path="/my-reservations" element={<MyReservations />} />

          {/* Nested routes: AdminLayout shows the sidebar, <Outlet /> shows the matching child page */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="tables" element={<AdminTables />} />
            <Route path="reservations" element={<AdminReservations />} />
          </Route>

          <Route path="*" element={<div className="page"><p className="empty">Page not found.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
