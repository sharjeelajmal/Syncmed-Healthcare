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

export async function sendLeadNotificationEmail(lead: {
  name: string
  email: string
  phone?: string | null
  type: string
  message: string
}) {
  // Fallback to log if credentials are missing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MAIL FALLBACK] SMTP credentials missing. Lead Notification for: ${lead.email}`)
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  try {
    await transporter.sendMail({
      from: `"SyncMed Concierge" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Lead: ${lead.name} (${lead.type === "patient_registration" ? "New Patient Registration" : "General Inquiry"})`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; font-weight: 900; margin-bottom: 4px;">SyncMed Concierge</h2>
          <p style="color: #67BA2E; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 0;">New Lead Notification</p>
          <p style="color: #475569; font-size: 14px;">A new lead has been submitted through the public inquiry form.</p>
          <div style="background: #f8fafc; padding: 16px; margin: 20px 0; border-radius: 12px; font-size: 14px; color: #334155; line-height: 1.6; border: 1px solid #f1f5f9;">
            <strong>Name:</strong> ${lead.name}<br/>
            <strong>Email:</strong> ${lead.email}<br/>
            <strong>Phone:</strong> ${lead.phone || 'Not Provided'}<br/>
            <strong>Inquiry Type:</strong> ${lead.type === 'patient_registration' ? 'New Patient Registration' : 'General Question'}<br/>
            <strong>Message:</strong><br/>
            <p style="margin-top: 8px; font-style: italic; color: #475569; padding-left: 8px; border-left: 2px solid #67BA2E;">"${lead.message}"</p>
          </div>
          <p style="color: #94a3b8; font-size: 11px;">This notification was automatically sent by the SyncMed Healthcare platform.</p>
        </div>
      `
    })
  } catch (error) {
    console.error("Error sending lead notification email:", error)
  }
}

export async function sendLeadConfirmationEmail(lead: {
  name: string
  email: string
  type: string
}) {
  // Fallback to log if credentials are missing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MAIL FALLBACK] SMTP credentials missing. User Confirmation for: ${lead.email}`)
    return
  }

  try {
    await transporter.sendMail({
      from: `"SyncMed Concierge" <${process.env.SMTP_USER}>`,
      to: lead.email,
      subject: `Thank you for contacting SyncMed Healthcare`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; font-weight: 900; margin-bottom: 4px; font-family: 'Inter', sans-serif;">SyncMed Healthcare</h2>
          <p style="color: #67BA2E; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 0;">Inquiry Received</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Dear <strong>${lead.name}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for reaching out to SyncMed Healthcare. We have successfully received your inquiry regarding <strong>${
              lead.type === "patient_registration" ? "New Patient Registration" : "General Question"
            }</strong>.
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Our administrative and clinical support staff are reviewing your details. We aim to respond to all inquiries within 24 to 48 business hours.
          </p>
          <div style="margin: 24px 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">This is an automated confirmation of your submission. Please do not reply directly to this message.</p>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error("Error sending user confirmation email:", error)
  }
}

