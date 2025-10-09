import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  People as PeopleIcon,
  Book as BookIcon
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <div>Access Denied</div>;
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%' }}>
      <Box sx={{ maxWidth: '1800px', mx: 'auto' }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography component="h1" variant="h4" color="primary" gutterBottom>
            Admin Dashboard
          </Typography>

          <Grid container spacing={3}>
            {/* New Book */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AddIcon />
                    </Avatar>
                  }
                  title="Add New Book"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Add new books to the catalog
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Books Management */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <BookIcon />
                    </Avatar>
                  }
                  title="Books Management"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Manage existing books
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Users Management */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <PeopleIcon />
                    </Avatar>
                  }
                  title="Users Management"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Manage user accounts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Orders Management */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <ListIcon />
                    </Avatar>
                  }
                  title="Orders Management"
                  titleTypographyProps={{ align: 'center' }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Manage orders and shipping
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
