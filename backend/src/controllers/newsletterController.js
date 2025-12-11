const nodemailer = require('nodemailer');
const newsletterModel = require('../models/newsletterModel');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD
    }
});

const newsletterController = {
    subscribe: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: 'Vui lòng nhập email.' });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ.' });

            await newsletterModel.addSubscriber(email);
            return res.status(201).json({ message: 'Đăng ký thành công! Chào mừng đến với StoryVerse.' });
        } catch (error) {
            console.error('Lỗi subscribe:', error);
            if (error.code === 'ER_DUP_ENTRY') { 
                return res.status(400).json({ message: 'Email này đã được đăng ký trước đó.' });
            }
            return res.status(500).json({ message: 'Lỗi server.' });
        }
    },

    sendBroadcast: async (req, res) => {
        try {
            const { subject, content } = req.body;

            if (!subject || !content) {
                return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và nội dung.' });
            }

            const subscribers = await newsletterModel.getAllSubscribers();
            if (subscribers.length === 0) {
                return res.status(404).json({ message: 'Chưa có người đăng ký nào.' });
            }

            const emailList = subscribers.map(sub => sub.email);

            const logoUrl = "https://res.cloudinary.com/dyefom7du/image/upload/v1764951838/ld6yhb7jry6tcptfxmw5.png"; 

            const htmlTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                        .header { background-color: #18181b; padding: 30px 20px; text-align: center; }
                        .header img { max-height: 50px; width: auto; }
                        .content { padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px; }
                        .footer { background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #e4e4e7; }
                        .footer a { color: #4f46e5; text-decoration: none; }
                        .btn { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${logoUrl}" alt="StoryVerse Logo" style="color: #fff; font-size: 20px; font-weight: bold;">
                        </div>

                        <div class="content">
                            <h2 style="margin-top: 0; color: #111827;">${subject}</h2>
                            <div>
                                ${content} 
                            </div>
                        </div>

                        <div class="footer">
                            <p>Bạn nhận được email này vì đã đăng ký bản tin của <strong>StoryVerse</strong>.</p>
                            <p>Dĩ An, Bình Dương, Việt Nam | <a href="mailto:support@storyverse.com">support@storyverse.com</a></p>
                            <p>&copy; ${new Date().getFullYear()} StoryVerse. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: `"StoryVerse Official" <${process.env.MAIL_USER}>`,
                bcc: emailList, 
                subject: subject,
                html: htmlTemplate
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({ 
                message: `Đã gửi thành công tới ${emailList.length} thành viên.` 
            });

        } catch (error) {
            console.error('Lỗi gửi broadcast:', error);
            return res.status(500).json({ message: 'Lỗi khi gửi email hàng loạt.' });
        }
    }
};

module.exports = newsletterController;