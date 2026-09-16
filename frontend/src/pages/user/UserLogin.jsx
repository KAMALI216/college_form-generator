import React, { useState } from 'react';
import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userLogin } from '../../services/userAuthService';
import { useUserAuth } from '../../context/UserAuthContext';

function UserLogin() {
  const navigate = useNavigate();
  const { login } = useUserAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await userLogin(formData);
      login(data.token, { id: data.id, email: data.email, role: data.role });
      navigate('/forms');
    } catch (requestError) {
      setError(requestError.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
          <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Button component={RouterLink} to="/user/register" variant="text">
            Create account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default UserLogin;