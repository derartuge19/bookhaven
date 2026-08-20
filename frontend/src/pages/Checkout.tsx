import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Stepper, Step, StepLabel, Button, Box,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid, Divider
} from '@mui/material';
import { CreditCard, LocalShipping, CheckCircle } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Checkout = () => {
  const { items, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', state: '', zip: '',
    cardNumber: '', cardName: '', expiry: '', cvv: ''
  });
  
  const steps = ['Shipping', 'Payment', 'Review'];
  
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Place order
      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderNumber: `#${Math.floor(100000 + Math.random() * 900000)}`,
          items,
          total: total * 1.1 // Include 10% tax
        }
      });
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth name="name" label="Full Name" required /></Grid>
            <Grid item xs={12}><TextField fullWidth name="email" type="email" label="Email" required /></Grid>
            <Grid item xs={12}><TextField fullWidth name="address" label="Address" required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth name="city" label="City" required /></Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select name="state" label="State" required value={formData.state || ''} onChange={e => { const { name, value } = e.target as { name: string; value: string }; setFormData(prev => ({ ...prev, [name]: value })); }}>
                  <MenuItem value="CA">CA</MenuItem>
                  <MenuItem value="NY">NY</MenuItem>
                  <MenuItem value="TX">TX</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth name="zip" label="ZIP" required /></Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth name="cardNumber" label="Card Number" required /></Grid>
            <Grid item xs={12}><TextField fullWidth name="cardName" label="Name on Card" required /></Grid>
            <Grid item xs={6}><TextField fullWidth name="expiry" label="MM/YY" required /></Grid>
            <Grid item xs={6}><TextField fullWidth name="cvv" label="CVV" required /></Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            {items.map(item => (
              <Box key={item.id} display="flex" mb={2}>
                <Box width={60} height={80} mr={2} bgcolor="#eee" />
                <Box flexGrow={1}>
                  <Typography>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.quantity} × ${Number(item.price).toFixed(2)}
                  </Typography>
                </Box>
                <Typography>${(Number(item.price) * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box textAlign="right">
              <Typography>Subtotal: ${Number(total).toFixed(2)}</Typography>
              <Typography>Tax (10%): ${(Number(total) * 0.1).toFixed(2)}</Typography>
              <Typography variant="h6">Total: ${(Number(total) * 1.1).toFixed(2)}</Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout;
