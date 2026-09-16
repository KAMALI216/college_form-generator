import React from 'react';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link } from 'react-router-dom';

function SubmitSuccess() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 5, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
          <Typography variant="h4" component="h1">
            Your form has been submitted successfully!
          </Typography>
          <Button component={Link} to="/forms" variant="contained">
            Fill Another Form
          </Button>
          <Button component={Link} to="/user/my-submissions" variant="outlined">
            View My Submissions
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default SubmitSuccess;