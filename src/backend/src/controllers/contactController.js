const contactModel = require('../models/contactModel');

const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
        }

        await contactModel.createContact({ name, email, subject, message });

        return res.status(201).json({ message: 'Gửi liên hệ thành công!' });
    } catch (error) {
        console.error('Lỗi khi gửi liên hệ:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = { submitContact };