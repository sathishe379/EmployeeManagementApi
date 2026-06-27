import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, searchEmployees, deleteEmployee } from '../services/api';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to load employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchEmployees();
      return;
    }
    try {
      const res = await searchEmployees(searchTerm);
      setEmployees(res.data);
    } catch (err) {
      setError('Search failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: 15 }}>Employee List</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Search by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        <Link to="/employees/add">
          <button className="btn btn-success">+ Add</button>
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.firstName} {emp.lastName}</td>
              <td>{emp.maskedEmail}</td>
              <td>{emp.departmentName || '-'}</td>
              <td>${emp.salary?.toLocaleString()}</td>
              <td>
                <Link to={`/employees/edit/${emp.id}`}>
                  <button className="btn btn-primary" style={{ marginRight: 5, padding: '5px 12px' }}>Edit</button>
                </Link>
                <button className="btn btn-danger" style={{ padding: '5px 12px' }} onClick={() => handleDelete(emp.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No employees found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
