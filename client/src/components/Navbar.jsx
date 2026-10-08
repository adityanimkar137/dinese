import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [open, setOpen] = useState(false); // controls the mobile menu

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" onClick={closeMenu}>DineEase</Link>
        <button className="menu-btn" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/restaurants" onClick={closeMenu}>Restaurants</NavLink>
          <NavLink to="/my-reservations" onClick={closeMenu}>My Reservations</NavLink>
          <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
