import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployee, updateEmployee, getDepartments } from '../services/api';

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    hireDate: '',
    salary: '',
    departmentId: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([getEmployee(id), getDepartments()]);
        const emp = empRes.data;
        setForm({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || '',
          dateOfBirth: emp.dateOfBirth?.split('T')[0] || '',
          hireDate: emp.hireDate?.split('T')[0] || '',
          salary: emp.salary,
          departmentId: emp.departmentId,
          isActive: emp.isActive,
        });
        setDepartments(deptRes.data);
      } catch (err) {
        setError('Failed to load employee');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateEmployee(id, {
        ...form,
        salary: parseFloat(form.salary),
        departmentId: parseInt(form.departmentId),
      });
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2 style={{ marginBottom: 15 }}>Edit Employee</h2>
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
          <div className="form-group" style={{ marginTop: 10 }}>
            <label>
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} style={{ width: 'auto', marginRight: 8 }} />
              Active
            </label>
          </div>
          <div style={{ marginTop: 15 }}>
            <button className="btn btn-primary" type="submit" style={{ marginRight: 10 }}>Update</button>
            <button className="btn" type="button" onClick={() => navigate('/employees')} style={{ background: '#999', color: '#fff' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployee;
