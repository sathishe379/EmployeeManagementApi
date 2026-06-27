import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a237e', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Avatar sx={{ bgcolor: '#fff', width: 36, height: 36, mr: 1.5 }}>
            <GroupsIcon sx={{ color: '#1a237e', fontSize: 22 }} />
          </Avatar>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
            EMS
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
          <Button color="inherit" component={RouterLink} to="/dashboard" sx={{ textTransform: 'none', fontWeight: 500 }}>
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/employees" sx={{ textTransform: 'none', fontWeight: 500 }}>
            Employees
          </Button>
          {(user.role === 'Admin' || user.role === 'Manager') && (
            <Button color="inherit" component={RouterLink} to="/employees/add" sx={{ textTransform: 'none', fontWeight: 500 }}>
              Add Employee
            </Button>
          )}
        </Box>
        <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
          {user.unique_name} ({user.role})
        </Typography>
        <Button color="inherit" variant="outlined" size="small" onClick={handleLogout} sx={{ textTransform: 'none', borderColor: 'rgba(255,255,255,0.5)' }}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
