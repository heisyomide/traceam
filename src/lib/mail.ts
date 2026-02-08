import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"TRACEAM SECURITY" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};