const FlashSaleModel = require('../models/flashSaleModel');

const createFlashSale = async (req, res) => {
  try {
    const result = await FlashSaleModel.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo Flash Sale thành công', id: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getAllFlashSales = async (req, res) => {
  try {
    const sales = await FlashSaleModel.getAll();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getActiveFlashSale = async (req, res) => {
  try {
    const sale = await FlashSaleModel.getActiveSale();
    res.json(sale); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const getFlashSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await FlashSaleModel.getById(id);
        
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Flash Sale không tồn tại' });
        }
        
        res.json(sale);
    } catch (error) {
        console.error("Lỗi lấy chi tiết Flash Sale:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

const deleteFlashSale = async (req, res) => {
    try {
        await FlashSaleModel.delete(req.params.id);
        res.json({ success: true, message: 'Đã xóa Flash Sale' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
}

module.exports = { 
    createFlashSale, 
    getAllFlashSales, 
    getActiveFlashSale, 
    getFlashSaleById, 
    deleteFlashSale 
};