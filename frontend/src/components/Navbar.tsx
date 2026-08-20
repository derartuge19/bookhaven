import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        {isMobile && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: isMobile ? 1 : 0, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: 1,
            mr: isMobile ? 0 : 4
          }}
        >
          BookHaven
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/books"
              sx={{ mx: 1, fontWeight: 500 }}
            >
              Browse Books
            </Button>
            {user?.isAdmin && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/admin"
                sx={{ mx: 1, fontWeight: 500 }}
              >
                Admin
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit" 
            component={RouterLink} 
            to="/cart"
            size="large"
            sx={{ position: 'relative' }}
          >
            <Badge 
              badgeContent={itemCount} 
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 13,
                  padding: '0 4px',
                  height: 16,
                  minWidth: 16,
                },
              }}
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          
          {user ? (
            <IconButton 
              color="inherit" 
              onClick={logout}
              sx={{ p: 0.5, ml: 1 }}
            >
              <Avatar 
                alt={user.fullName || user.email || 'User'}
                src={user.profileImage}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {(user.fullName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </Avatar>
            </IconButton>
          ) : (
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              startIcon={<PersonIcon />}
              sx={{ ml: 1 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <Box sx={{ pb: 2, px: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Button 
            fullWidth 
            color="inherit" 
            component={RouterLink} 
            to="/books"
            sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1.5 }}
          >
            Browse Books
          </Button>
          {user?.isAdmin && (
            <Button 
              fullWidth 
              color="inherit" 
              component={RouterLink} 
              to="/admin"
              sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1.5 }}
            >
              Admin Dashboard
            </Button>
          )}
          <Button 
            fullWidth 
            color="inherit" 
            component={RouterLink} 
            to="/profile"
            sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1.5 }}
          >
            My Profile
          </Button>
        </Box>
      )}
    </AppBar>
  );
};

export default Navbar;
