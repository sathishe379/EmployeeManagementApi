import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch,
  Skeleton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEmployee, updateEmployee, getDepartments } from '../services/api';
import type { DepartmentDto } from '../types';

export default function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
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
        const [empRes, deptRes] = await Promise.all([
          getEmployee(Number(id)),
          getDepartments(),
        ]);
        const emp = empRes.data;
        setForm({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || '',
          dateOfBirth: emp.dateOfBirth?.split('T')[0] || '',
          hireDate: emp.hireDate?.split('T')[0] || '',
          salary: String(emp.salary),
          departmentId: String(emp.departmentId),
          isActive: emp.isActive,
        });
        setDepartments(deptRes.data);
      } catch {
        setError('Failed to load employee');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Age validation: must be 18+
    const dob = new Date(form.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      setError('Employee must be at least 18 years old.');
      return;
    }

    try {
      await updateEmployee(Number(id), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth,
        hireDate: form.hireDate,
        salary: parseFloat(form.salary),
        departmentId: parseInt(form.departmentId),
        isActive: form.isActive,
      });
      navigate('/employees');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#f0f2f5', py: 4 }}>
        <Container maxWidth="md">
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#f0f2f5', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employees')}
            sx={{ mb: 1, textTransform: 'none', color: 'text.secondary' }}
          >
            Back to Employees
          </Button>
          <Typography variant="h4" fontWeight={700}>
            Edit Employee
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update employee information below
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {error && <Alert severity="error" sx={{ borderRadius: 0 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <Box sx={{ p: 4, pb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 2.5 }}>
                Personal Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                />
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }}
                />
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon color="action" /></InputAdornment> }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Employment Details */}
            <Box sx={{ p: 4, pt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary" sx={{ mb: 2.5 }}>
                Employment Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  label="Hire Date"
                  name="hireDate"
                  type="date"
                  value={form.hireDate}
                  onChange={handleChange}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon color="action" /></InputAdornment> }}
                />
                <TextField
                  label="Salary"
                  name="salary"
                  type="number"
                  value={form.salary}
                  onChange={handleChange}
                  fullWidth
                  required
                  slotProps={{ htmlInput: { min: 1, max: 100000 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon color="action" /></InputAdornment> }}
                />
                <TextField
                  label="Department"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  fullWidth
                  required
                  select
                  InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        color="success"
                      />
                    }
                    label={form.isActive ? 'Active' : 'Inactive'}
                  />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Actions */}
            <Box sx={{ p: 3, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/employees')}
                sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  textTransform: 'none',
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                }}
              >
                Update Employee
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
