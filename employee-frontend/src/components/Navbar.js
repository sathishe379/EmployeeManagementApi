import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="navbar">
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/employees/add">Add Employee</Link>
      </div>
      <div>
        <span style={{ marginRight: 15 }}>
          {user?.unique_name || user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']} ({user?.role || user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']})
        </span>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
