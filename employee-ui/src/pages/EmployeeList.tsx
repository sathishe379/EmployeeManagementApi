import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { getEmployees, searchEmployees, deleteEmployee } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import type { EmployeeDto } from '../types';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [filtered, setFiltered] = useState<EmployeeDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const { isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch {
      setError('Failed to load employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (statusFilter === 'active') {
      setFiltered(employees.filter((e) => e.isActive));
    } else if (statusFilter === 'inactive') {
      setFiltered(employees.filter((e) => !e.isActive));
    } else {
      setFiltered(employees);
    }
  }, [employees, statusFilter]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchEmployees();
      return;
    }
    try {
      const res = await searchEmployees(searchTerm);
      setEmployees(res.data);
    } catch {
      setError('Search failed');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      // Remove the record from the list
      setEmployees((prev) => prev.filter((emp) => emp.id !== deleteId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        {(isAdmin || isManager) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/employees/add')}
          >
            Add Employee
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Department</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Salary</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                <TableCell>{emp.maskedEmail}</TableCell>
                <TableCell>{emp.departmentName || '-'}</TableCell>
                <TableCell>${emp.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={emp.isActive ? 'Active' : 'Inactive'}
                    color={emp.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {(isAdmin || isManager) && (
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/employees/edit/${emp.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {isAdmin && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => setDeleteId(emp.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Container>
  );
}
