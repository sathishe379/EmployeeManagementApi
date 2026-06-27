import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Skeleton, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getEmployees, getDepartments } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalEmployees: 0, activeEmployees: 0, departments: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([getEmployees(), getDepartments()]);
        setStats({
          totalEmployees: empRes.data.length,
          activeEmployees: empRes.data.filter((e) => e.isActive).length,
          departments: deptRes.data.length,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Total Employees',
      value: stats.totalEmployees,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgIcon: <PeopleIcon sx={{ fontSize: 120, position: 'absolute', right: -10, bottom: -10, opacity: 0.1 }} />,
      link: '/employees',
    },
    {
      label: 'Active Employees',
      value: stats.activeEmployees,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      bgIcon: <CheckCircleIcon sx={{ fontSize: 120, position: 'absolute', right: -10, bottom: -10, opacity: 0.1 }} />,
      link: '/employees?status=active',
    },
    {
      label: 'Departments',
      value: stats.departments,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bgIcon: <BusinessIcon sx={{ fontSize: 120, position: 'absolute', right: -10, bottom: -10, opacity: 0.1 }} />,
      link: '/employees',
    },
  ];

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#f0f2f5', pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back, <strong>{user?.unique_name || 'User'}</strong>! Here's your overview.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          {cards.map((card) => (
            loading ? (
              <Skeleton key={card.label} variant="rounded" height={160} sx={{ borderRadius: 3 }} />
            ) : (
              <Paper
                key={card.label}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: card.gradient,
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.3)',
                  },
                }}
                onClick={() => navigate(card.link)}
              >
                {card.bgIcon}
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', display: 'inline-flex' }}>
                      {card.icon}
                    </Box>
                    <TrendingUpIcon sx={{ opacity: 0.7 }} />
                  </Box>
                  <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, fontWeight: 500 }}>
                    {card.label}
                  </Typography>
                </Box>
              </Paper>
            )
          ))}
        </Box>

        {/* Quick Actions + System Info */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, alignItems: 'stretch' }}>
          {/* Quick Actions */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Quick Actions
              </Typography>
              <Chip label={user?.role || 'User'} color="primary" size="small" />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid #e3f2fd',
                  bgcolor: '#f5f9ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#e3f2fd', transform: 'scale(1.02)' },
                }}
                onClick={() => navigate('/employees')}
              >
                <AssessmentIcon sx={{ fontSize: 36, color: '#1976d2', mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>View Employees</Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid #e8f5e9',
                  bgcolor: '#f5fff7',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#e8f5e9', transform: 'scale(1.02)' },
                }}
                onClick={() => navigate('/employees/add')}
              >
                <GroupAddIcon sx={{ fontSize: 36, color: '#388e3c', mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>Add Employee</Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid #fce4ec',
                  bgcolor: '#fffbfc',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#fce4ec', transform: 'scale(1.02)' },
                }}
                onClick={() => navigate('/employees')}
              >
                <TrendingUpIcon sx={{ fontSize: 36, color: '#c62828', mb: 1 }} />
                <Typography variant="body2" fontWeight={600}>Analytics</Typography>
              </Paper>
            </Box>
          </Paper>

          {/* System Info */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              System Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Chip label={user?.role} size="small" color="primary" variant="outlined" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Username</Typography>
                <Typography variant="body2" fontWeight={600}>{user?.unique_name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label="Online" size="small" color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">API</Typography>
                <Chip label="Connected" size="small" color="success" variant="outlined" />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
