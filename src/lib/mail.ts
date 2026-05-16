import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOTPEmail(to: string, otp: string) {
  // Fallback to log if credentials are missing so it never violently crashes
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MAIL FALLBACK] SMTP credentials missing. OTP for ${to}: ${otp}`)
    return
  }

  try {
    await transporter.sendMail({
      from: `"SyncMed Concierge" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your SyncMed Security Code",
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #0f172a; font-weight: 900;">SyncMed Security</h2>
          <p style="color: #475569; font-size: 14px;">Use the following 6-digit secure verification code to reset your account password. This code will expire in 15 minutes.</p>
          <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #67BA2E; margin: 24px 0; border-radius: 12px;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 11px;">If you did not request this code, please ignore this email or contact support.</p>
        </div>
      `
    })
  } catch (error) {
    console.error("Error sending email:", error)
    // Even if it fails, we log it so developer can see it in terminal
    console.log(`[MAIL ERROR] OTP for ${to}: ${otp}`)
  }
}
