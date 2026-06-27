import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee, getDepartments } from '../services/api';

function AddEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    departmentId: '',
  });

  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEmployee({
        ...form,
        salary: parseFloat(form.salary),
        departmentId: parseInt(form.departmentId),
      });
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.Salary?.[0] || 'Failed to create employee');
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: 15 }}>Add Employee</h2>
      <div className="card">
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div className="form-group">
              <label>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Hire Date</label>
              <input name="hireDate" type="date" value={form.hireDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Salary *</label>
              <input name="salary" type="number" min="1" max="100000" value={form.salary} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 15 }}>
            <button className="btn btn-success" type="submit" style={{ marginRight: 10 }}>Save</button>
            <button className="btn" type="button" onClick={() => navigate('/employees')} style={{ background: '#999', color: '#fff' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;
