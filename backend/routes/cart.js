const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', cartController.getCart);

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post(
  '/items',
  [
    body('bookId', 'Book ID is required').not().isEmpty(),
    body('title', 'Title is required').not().isEmpty(),
    body('price', 'Price is required and must be a positive number').isFloat({ min: 0 }),
    body('quantity', 'Quantity must be a positive integer').optional().isInt({ min: 1 }),
    body('image', 'Image URL is required').optional().isString()
  ],
  cartController.addToCart
);

// @route   PUT /api/cart/items/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put(
  '/items/:itemId',
  [
    param('itemId', 'Item ID is required').isInt(),
    body('quantity', 'Quantity is required and must be a positive integer').isInt({ min: 1 })
  ],
  cartController.updateCartItem
);

// @route   DELETE /api/cart/items/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete(
  '/items/:itemId',
  [param('itemId', 'Item ID is required').isInt()],
  cartController.removeFromCart
);

// @route   DELETE /api/cart/clear
// @desc    Clear all items from cart
// @access  Private
router.delete('/clear', cartController.clearCart);

module.exports = router;
