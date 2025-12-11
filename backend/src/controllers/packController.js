const packModel = require('../models/packModel');

const getPublicPacks = async (req, res) => {
    try {
        const packs = await packModel.getAllPacks(false);
        res.json(packs);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách gói nạp' });
    }
};

const getAdminPacks = async (req, res) => {
    try {
        const packs = await packModel.getAllPacks(true);
        res.json(packs);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi admin lấy danh sách' });
    }
};

const createPack = async (req, res) => {
    try {
        await packModel.createPack(req.body);
        res.json({ success: true, message: 'Thêm gói thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm gói' });
    }
};

const updatePack = async (req, res) => {
    try {
        await packModel.updatePack(req.params.id, req.body);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật' });
    }
};

const deletePack = async (req, res) => {
    try {
        await packModel.deletePack(req.params.id);
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa gói' });
    }
};

module.exports = { getPublicPacks, getAdminPacks, createPack, updatePack, deletePack };