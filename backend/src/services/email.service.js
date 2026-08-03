import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-library-email@gmail.com",
    pass: process.env.EMAIL_PASS || "xxxx xxxx xxxx xxxx", // Mật khẩu ứng dụng Gmail 16 ký tự
  },
});

export const sendReminderEmail = async (toEmail, userName, bookTitle, dueDate) => {
  const mailOptions = {
    from: '"CTU Ebookshelf" <your-library-email@gmail.com>',
    to: toEmail,
    subject: "⏰ [CTU EBOOKSHELF] Nhắc nhở: Sách mượn sắp đến hạn trả vào ngày mai!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0284c7;">Xin chào ${userName},</h2>
        <p style="font-size: 15px; color: #333;">
          Hệ thống <strong>CTU Ebookshelf</strong> xin thông báo cuốn sách bạn đang mượn sắp đến hạn phải hoàn trả.
        </p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;"><strong>📚 Tên sách:</strong> ${bookTitle}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; color: #dc2626;"><strong>⏳ Hạn trả:</strong> Ngày mai (${dueDate})</p>
        </div>

        <p style="font-size: 14px; color: #555;">
          Vui lòng sắp xếp thời gian đến thư viện trả sách hoặc hoàn tất thủ tục online để tránh phát sinh phí phạt quá hạn <strong>(5.000 VNĐ / ngày)</strong>.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          Đây là email tự động từ Hệ thống Quản lý Thư viện CTU Ebookshelf. Vui lòng không phản hồi email này.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};