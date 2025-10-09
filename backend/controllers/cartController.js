const { Cart, CartItem, User } = require('../models');
const { Op } = require('sequelize');

// Get user's cart
const getCart = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { isActive: true },
                    include: [
                        {
                            model: CartItem,
                            as: 'items',
                            order: [['createdAt', 'DESC']]
                        }
                    ]
                }
            ]
        });

        if (!user || !user.cart) {
            return res.json({ items: [], total: 0 });
        }

        await user.cart.updateTotal();
        
        res.json({
            items: user.cart.items,
            total: user.cart.total
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { bookId, title, price, image, quantity = 1 } = req.body;

        if (!bookId || !title || price === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get or create user's active cart
        const user = await User.findByPk(req.userId);
        const cart = await user.getActiveCart();

        // Check if item already exists in cart
        let cartItem = await CartItem.findOne({
            where: {
                cartId: cart.id,
                bookId
            }
        });

        if (cartItem) {
            // Update quantity if item exists
            cartItem.quantity += parseInt(quantity, 10);
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                cartId: cart.id,
                bookId,
                title,
                price,
                image,
                quantity: parseInt(quantity, 10)
            });
        }

        // Update cart total
        await cart.updateTotal();

        // Return updated cart
        const updatedCart = await Cart.findByPk(cart.id, {
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        res.status(201).json({
            items: updatedCart.items,
            total: updatedCart.total
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            return removeFromCart(req, res);
        }

        // Find cart item
        const cartItem = await CartItem.findByPk(itemId, {
            include: [
                {
                    model: Cart,
                    as: 'cart',
                    where: { userId: req.userId }
                }
            ]
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update quantity
        cartItem.quantity = parseInt(quantity, 10);
        await cartItem.save();

        // Update cart total
        await cartItem.cart.updateTotal();

        // Return updated cart
        const updatedCart = await Cart.findByPk(cartItem.cartId, {
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        res.json({
            items: updatedCart.items,
            total: updatedCart.total
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ message: 'Error updating cart item' });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        // Find and delete cart item
        const deleted = await CartItem.destroy({
            where: {
                id: itemId,
                '$cart.userId$': req.userId
            },
            include: [
                {
                    model: Cart,
                    as: 'cart'
                }
            ]
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update cart total
        const cart = await Cart.findOne({
            where: { userId: req.userId, isActive: true },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (cart) {
            await cart.updateTotal();
            cart.total = await cart.updateTotal();
            await cart.save();
        }

        res.json({ message: 'Item removed from cart', success: true });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Error removing item from cart' });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        // Find user's active cart
        const cart = await Cart.findOne({
            where: {
                userId: req.userId,
                isActive: true
            }
        });

        if (!cart) {
            return res.json({ message: 'Cart is already empty' });
        }

        // Remove all cart items
        await CartItem.destroy({
            where: { cartId: cart.id }
        });

        // Reset cart total
        cart.total = 0;
        await cart.save();

        res.json({ message: 'Cart cleared successfully' });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Error clearing cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
