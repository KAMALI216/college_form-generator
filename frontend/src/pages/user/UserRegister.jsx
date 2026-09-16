import React, { useState } from 'react';
import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { userRegister } from '../../services/userAuthService';

function UserRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userRegister(formData);
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/user/login'), 1200);
    } catch (requestError) {
      setError(requestError.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Register
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} fullWidth required />
          <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
          <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Button component={RouterLink} to="/user/login" variant="text">
            Back to login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default UserRegister;