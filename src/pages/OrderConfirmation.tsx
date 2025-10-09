import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  author?: string;
}

interface OrderConfirmationLocationState {
  orderNumber: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location as { state: OrderConfirmationLocationState };
  
  // If page is accessed directly without state, redirect to home
  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) return null;

  const { orderNumber, items, total, shippingAddress } = state;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = total - subtotal;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}>
        <CheckCircleIcon 
          color="success" 
          sx={{ fontSize: 80, mb: 3 }} 
        />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Thank you for your order!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Your order number is: <strong>{orderNumber}</strong>
        </Typography>
        
        <Typography color="text.secondary" paragraph>
          We've sent an order confirmation to your email. You'll receive a shipping confirmation 
          email when your items are on their way.
        </Typography>
        
        <Box sx={{ my: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box 
                          component="img"
                          src={item.image || '/book-placeholder.png'}
                          alt={item.title}
                          sx={{ width: 50, height: 70, objectFit: 'cover', mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body2">{item.title}</Typography>
                          {item.author && (
                            <Typography variant="caption" color="text.secondary">
                              {item.author}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography>Subtotal: ${subtotal.toFixed(2)}</Typography>
            <Typography>Tax: ${tax.toFixed(2)}</Typography>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
              Order Total: ${total.toFixed(2)}
            </Typography>
          </Box>
          
          {shippingAddress && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Address
              </Typography>
              <Typography>{shippingAddress.name}</Typography>
              <Typography>{shippingAddress.address}</Typography>
              <Typography>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
              </Typography>
              <Typography>{shippingAddress.country}</Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate('/books')}
            fullWidth
          >
            Continue Shopping
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/profile/orders')}
            fullWidth
          >
            View Order History
          </Button>
        </Box>
        
        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our customer service at support@bookhaven.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;
