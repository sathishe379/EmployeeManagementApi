import React, { useEffect, useState } from 'react';
import { getEmployees, getDepartments } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({ totalEmployees: 0, departments: 0, activeEmployees: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([getEmployees(), getDepartments()]);
        setStats({
          totalEmployees: empRes.data.length,
          activeEmployees: empRes.data.filter((e) => e.isActive).length,
          departments: deptRes.data.length,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 10 }}>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Employees</h3>
          <div className="number">{stats.totalEmployees}</div>
        </div>
        <div className="dashboard-card">
          <h3>Active Employees</h3>
          <div className="number">{stats.activeEmployees}</div>
        </div>
        <div className="dashboard-card">
          <h3>Departments</h3>
          <div className="number">{stats.departments}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
