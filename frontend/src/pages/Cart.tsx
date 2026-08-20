import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Box,
  Divider,
  Grid,
  useTheme,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    itemCount,
    subtotal: contextSubtotal
  } = useCart();
  
  // Log items and subtotal for debugging
  useEffect(() => {
    console.log('Cart items:', items);
    console.log('Context subtotal:', contextSubtotal);
  }, [items, contextSubtotal]);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Format price helper function
  const formatPrice = (price: number | string, currencyCode: string = 'USD') => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(numericPrice);
  };

  // Calculate totals
  const calculateItemTotal = (price: number | string, quantity: number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price) || 0;
    return numericPrice * quantity;
  };

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item.price, item.quantity);
    console.log(`Item ${item.id} - Price: ${item.price}, Qty: ${item.quantity}, Total: ${itemTotal}`);
    return sum + itemTotal;
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  console.log('Calculated subtotal:', subtotal);
  console.log('Context subtotal:', contextSubtotal);

  const handleQuantityChange = (id: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty > 0) {
      updateQuantity(id, newQty);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // In a real app, you would redirect to a checkout page or payment processor
    // For now, we'll just show a success message
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      alert('Order placed successfully! Thank you for your purchase.');
      navigate('/');
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" paragraph>
          Looks like you haven't added any books to your cart yet.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/books')}
          sx={{ mt: 2 }}
        >
          Browse Books
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={item.image || '/book-placeholder.png'}
                          alt={item.title}
                          sx={{ width: 60, height: 90, objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="subtitle1">{item.title}</Typography>
                          {item.author && (
                            <Typography variant="body2" color="text.secondary">
                              {item.author}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(item.price, item.currencyCode)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          type="number"
                          inputProps={{ min: 1, style: { textAlign: 'center', width: '40px' } }}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value, 10);
                            if (!isNaN(newQty) && newQty > 0) {
                              updateQuantity(item.id, newQty);
                            }
                          }}
                          sx={{ mx: 1, width: '60px' }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(calculateItemTotal(item.price, item.quantity), item.currencyCode)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => removeFromCart(item.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={clearCart}
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ mr: 2 }}
            >
              Clear Cart
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/books')}
            >
              Continue Shopping
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</Typography>
                <Typography>{formatPrice(subtotal, items[0]?.currencyCode)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography>Free</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax (10%)</Typography>
                <Typography>{formatPrice(tax, items[0]?.currencyCode)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {formatPrice(total, items[0]?.currencyCode)}
                </Typography>
              </Box>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/checkout')}
              disabled={isCheckingOut || items.length === 0}
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              * This is a demo. No real payment will be processed.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
