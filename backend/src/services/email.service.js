const { Resend } = require("resend");
const { RESEND_API_KEY, EMAIL_FROM } = require("../config/env");

const resend = new Resend(RESEND_API_KEY);

const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: process.env.NODE_ENV === "production" ? email : "skillswap.webapp0409@gmail.com",
    subject: "Verify your SkillSwap account",
    html: `
      <h2>Welcome to SkillSwap, ${name}!</h2>
      <p>Click the link below to verify your email address.</p>
      <p>This link expires in 24 hours.</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #6c47ff;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        margin-top: 16px;
      ">Verify Email</a>
      <p style="margin-top: 24px; color: #888;">If you didn't create an account, ignore this email.</p>
    `,
  });
};

module.exports = { sendVerificationEmail };
