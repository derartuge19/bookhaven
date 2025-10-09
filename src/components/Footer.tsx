import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Book as BookIcon,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  
  // Navigation links
  const quickLinks = [
    { 
      text: 'Browse Books', 
      to: '/books',
      query: 'q=books&category=all'
    },
    { 
      text: 'New Releases', 
      to: '/books',
      query: 'q=new releases&orderBy=newest'
    },
    { 
      text: 'Bestsellers', 
      to: '/books',
      query: 'q=bestsellers&filter=paid-ebooks&orderBy=relevance'
    },
    { 
      text: 'Genres', 
      to: '/books',
      query: 'q=books&category=fiction'
    },
    { 
      text: 'Authors', 
      to: '/books',
      query: 'q=author'
    },
  ];

  const customerServiceLinks = [
    { 
      text: 'Contact Us', 
      to: '/contact'
    },
    { 
      text: 'FAQs', 
      to: '/faq'
    },
    { 
      text: 'Shipping Info', 
      to: '/shipping'
    },
    { 
      text: 'Returns', 
      to: '/returns'
    },
    { 
      text: 'Privacy Policy', 
      to: '/privacy'
    },
  ];

  const legalLinks = [
    { 
      text: 'Terms of Service', 
      to: '/terms'
    },
    { 
      text: 'Privacy Policy', 
      to: '/privacy'
    },
    { 
      text: 'Cookie Policy', 
      to: '/cookies'
    },
  ];
  
  // Function to create a link with optional query parameters
  const createLink = (to: string, query?: string) => {
    return query ? `${to}?${query}` : to;
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        pt: 8,
        pb: 4,
        borderTop: `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Brand and Description */}
          <Grid item xs={12} md={3}>
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', mb: 2, textDecoration: 'none', color: 'inherit' }}>
              <BookIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                BookHaven
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your ultimate destination for discovering and purchasing your next favorite book. We offer a wide selection of titles across all genres.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <IconButton aria-label="Facebook" color="primary" component="a" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="Twitter" color="primary" component="a" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="Instagram" color="primary" component="a" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="LinkedIn" color="primary" component="a" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickLinks.map((link) => (
                <Link 
                  key={link.text}
                  component={RouterLink}
                  to={createLink(link.to, link.query)}
                  color="text.secondary"
                  underline="hover"
                  sx={{ display: 'block' }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {customerServiceLinks.map((link) => (
                <Link 
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  color="text.secondary"
                  underline="hover"
                  sx={{ display: 'block' }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="primary" fontSize="small" />
                <Link href="mailto:support@bookhaven.com" color="text.secondary" underline="hover">
                  support@bookhaven.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon color="primary" fontSize="small" />
                <Link href="tel:+251932220014" color="text.secondary" underline="hover">
                  +251 93 222 0014
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Addis Ababa, Ethiopia
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {new Date().getFullYear()} BookHaven. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            {legalLinks.map((link) => (
              <Link 
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="text.secondary"
                variant="body2"
                underline="hover"
              >
                {link.text}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
