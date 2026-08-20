import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Avatar,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Paper elevation={3} sx={{ p: 4, mt: 8, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Profile
        </Typography>

        <Box sx={{ mt: 4, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 100, height: 100 }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || ''}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" gutterBottom>
                {user?.fullName || user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={logout}
          sx={{ mt: 3 }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;
