const nodemailer = require('nodemailer');
const { getConnection } = require('../db/connection');
const contactModel = require('../models/contactModel');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,        
        pass: process.env.MAIL_APP_PASSWORD 
    }
});

const contactController = {
    // 1. Xử lý người dùng gửi form liên hệ
    submitContact: async (req, res) => {
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
    },

    // 2. Lấy danh sách liên hệ
    getContacts: async (req, res) => {
        try {
            const connection = getConnection();
            const [rows] = await connection.execute('SELECT * FROM contact_messages ORDER BY createdAt DESC');
            res.json(rows);
        } catch (error) {
            console.error('Lỗi lấy danh sách liên hệ:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // 3. Admin phản hồi liên hệ
    replyContact: async (req, res) => {
        try {
            const { id, email, name, replyMessage } = req.body;
            const file = req.file;

            if (!id || !replyMessage) {
                return res.status(400).json({ message: 'Thiếu thông tin phản hồi.' });
            }

            // Kiểm tra xem biến môi trường có được nạp chưa
            if (!process.env.MAIL_USER || !process.env.MAIL_APP_PASSWORD) {
                console.error("Thiếu cấu hình mail trong .env");
                return res.status(500).json({ message: 'Lỗi cấu hình server (mail).' });
            }

            // --- Nội dung Email HTML ---
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1e293b; padding: 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0;">StoryVerse</h1>
                    </div>
                    
                    <div style="padding: 20px; background-color: #ffffff; color: #333333;">
                        <p>Xin chào <strong>${name}</strong>,</p>
                        <p>Cảm ơn bạn đã liên hệ với StoryVerse. Chúng tôi đã nhận được tin nhắn của bạn và đây là phản hồi từ quản trị viên:</p>
                        
                        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; font-style: italic;">
                            "${replyMessage}"
                        </div>

                        <p>Nếu bạn có thêm câu hỏi, đừng ngần ngại trả lời email này.</p>
                    </div>

                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                        <p style="margin: 5px 0;"><strong>StoryVerse Support Team</strong></p>
                        <p style="margin: 5px 0;">📍 Địa chỉ: Dĩ An, Bình Dương, Việt Nam</p>
                        <p style="margin: 5px 0;">📞 SĐT: +84 123 456 789</p>
                        <p style="margin: 5px 0;">✉️ Email: support@storyverse.com</p>
                        <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} StoryVerse. All rights reserved.</p>
                    </div>
                </div>
            `;

            const mailOptions = {
                from: `"StoryVerse Support" <${process.env.MAIL_USER}>`,
                to: email,
                subject: 'Phản hồi từ StoryVerse: Về liên hệ của bạn',
                html: htmlContent,
                attachments: []
            };

            if (file) {
                mailOptions.attachments.push({
                    filename: file.originalname,
                    content: file.buffer
                });
            }

            await transporter.sendMail(mailOptions);

            const connection = getConnection();
            await connection.execute(
                'UPDATE contact_messages SET status = ?, admin_response = ? WHERE id = ?', 
                ['replied', replyMessage, id]
            );

            res.status(200).json({ message: 'Đã gửi phản hồi thành công!' });

        } catch (error) {
            console.error('Lỗi gửi mail phản hồi:', error);
            res.status(500).json({ message: 'Lỗi khi gửi mail phản hồi.' });
        }
    }
};

module.exports = contactController;