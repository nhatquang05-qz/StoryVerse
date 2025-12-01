const cartModel = require('../models/cartModel');
const FlashSaleModel = require('../models/flashSaleModel');

const enrichCartWithFlashSale = async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return [];

    const enrichedItems = await Promise.all(cartItems.map(async (item) => {
        const saleInfo = await FlashSaleModel.getActiveFlashSaleForComic(item.comicId);

        if (saleInfo) {
            return {
                ...item,
                originalPrice: item.price,
                price: saleInfo.salePrice,
                flashSalePrice: saleInfo.salePrice,
                isFlashSale: true,
                saleName: saleInfo.saleName,
            };
        }
        
        return {
            ...item,
            isFlashSale: false
        };
    }));

    return enrichedItems;
};

const getCart = async (req, res) => {
    try {
        const userId = req.userId; 
        
        const rawCartItems = await cartModel.getCartByUserId(userId);
        
        const cartItems = await enrichCartWithFlashSale(rawCartItems);

        res.json(cartItems);
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ message: 'Lỗi tải giỏ hàng' });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { comicId, quantity } = req.body;        
        if (!comicId || !quantity) return res.status(400).json({ message: 'Thiếu thông tin' });

        await cartModel.addToCartRaw(userId, comicId, quantity);        
        
        const rawCart = await cartModel.getCartByUserId(userId);
        const updatedCart = await enrichCartWithFlashSale(rawCart);
        
        res.json(updatedCart);
    } catch (error) {
        console.error('Add Cart Error:', error);
        res.status(500).json({ message: 'Lỗi thêm vào giỏ' });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const userId = req.userId;
        const { comicId, quantity } = req.body;

        if (quantity <= 0) {
            await cartModel.removeFromCartRaw(userId, comicId);
        } else {
            await cartModel.updateQuantityRaw(userId, comicId, quantity);
        }

        const rawCart = await cartModel.getCartByUserId(userId);
        const updatedCart = await enrichCartWithFlashSale(rawCart);
        
        res.json(updatedCart);
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật giỏ hàng' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { comicId } = req.params;

        await cartModel.removeFromCartRaw(userId, comicId);
        
        const rawCart = await cartModel.getCartByUserId(userId);
        const updatedCart = await enrichCartWithFlashSale(rawCart);
        
        res.json(updatedCart);
    } catch (error) {
        console.error('Remove Cart Error:', error);
        res.status(500).json({ message: 'Lỗi xóa sản phẩm' });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.userId;
        await cartModel.clearCartRaw(userId);
        res.json({ message: 'Đã xóa giỏ hàng', cart: [] });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({ message: 'Lỗi làm trống giỏ hàng' });
    }
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };