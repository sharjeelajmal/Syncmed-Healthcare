import { BrevoClient } from "@getbrevo/brevo"

const SENDER = { name: "SyncMed Health", email: "support@syncmed.health" } as const

const apiInstance = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY ?? "",
}).transactionalEmails

export async function sendOTPEmail(to: string, otp: string) {
  // Fallback to log if credentials are missing so it never violently crashes
  if (!process.env.BREVO_API_KEY) {
    console.log(`[MAIL FALLBACK] Brevo API key missing. OTP for ${to}: ${otp}`)
    return
  }

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: to }],
      subject: "Your SyncMed Security Code",
      htmlContent: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #0f172a; font-weight: 900;">SyncMed Security</h2>
          <p style="color: #475569; font-size: 14px;">Use the following 6-digit secure verification code to reset your account password. This code will expire in 15 minutes.</p>
          <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #67BA2E; margin: 24px 0; border-radius: 12px;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 11px;">If you did not request this code, please ignore this email or contact support.</p>
        </div>
      `,
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
  if (!process.env.BREVO_API_KEY) {
    console.log(`[MAIL FALLBACK] Brevo API key missing. Lead Notification for: ${lead.email}`)
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL || "support@syncmed.health"
  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: adminEmail }],
      subject: `New Lead: ${lead.name} (${lead.type === "patient_registration" ? "New Patient Registration" : "General Inquiry"})`,
      htmlContent: `
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
      `,
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
  if (!process.env.BREVO_API_KEY) {
    console.log(`[MAIL FALLBACK] Brevo API key missing. User Confirmation for: ${lead.email}`)
    return
  }

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: lead.email }],
      subject: `Thank you for contacting SyncMed Healthcare`,
      htmlContent: `
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
      `,
    })
  } catch (error) {
    console.error("Error sending user confirmation email:", error)
  }
}

function getPortalLoginUrl(): string {
  return (
    process.env.PORTAL_LOGIN_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  )
}

export async function sendAccountWelcomeEmail(payload: {
  to: string
  fullName: string
  roleLabel: "Provider" | "Patient"
  loginEmail: string
  temporaryPassword: string
}) {
  if (!process.env.BREVO_API_KEY) {
    console.log(`[MAIL FALLBACK] Brevo API key missing. Welcome email for: ${payload.to}`)
    return
  }

  const loginUrl = getPortalLoginUrl()

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: payload.to }],
      subject: `Welcome to SyncMed ${payload.roleLabel} Portal`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #67BA2E; color: white; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 20px;">Welcome to SyncMed</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9;">Your ${payload.roleLabel.toLowerCase()} account is now active.</p>
          </div>
          <div style="padding: 20px 24px; color: #334155;">
            <p>Hello ${payload.fullName},</p>
            <p>Your administrator has created your SyncMed account. Use the credentials below to sign in:</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 14px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Login Email:</strong> ${payload.loginEmail}</p>
              <p style="margin: 0;"><strong>Temporary Password:</strong> ${payload.temporaryPassword}</p>
            </div>
            <p style="margin: 14px 0;">Portal login: <a href="${loginUrl}" target="_blank" rel="noreferrer">${loginUrl}</a></p>
            <p style="margin: 14px 0 0 0;">For security, please change your password immediately after first sign-in.</p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending welcome email:", error)
  }
}

export async function sendProviderAssignmentEmail(payload: {
  to: string
  providerName: string
  patientName: string
  patientId: string
}) {
  if (!process.env.BREVO_API_KEY) {
    console.log(`[MAIL FALLBACK] Brevo API key missing. Assignment email for: ${payload.to}`)
    return
  }

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: payload.to }],
      subject: `New Patient Assignment: ${payload.patientName}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; color: #334155;">
          <h2 style="margin: 0 0 8px 0; color: #0f172a;">SyncMed Assignment Notification</h2>
          <p style="margin: 0 0 12px 0;">Dear ${payload.providerName},</p>
          <p style="margin: 0 0 12px 0;">A patient has been assigned to your clinical panel.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
            <p style="margin: 0 0 8px 0;"><strong>Patient:</strong> ${payload.patientName}</p>
            <p style="margin: 0;"><strong>Patient ID:</strong> ${payload.patientId}</p>
          </div>
          <p style="margin: 14px 0 0 0;">Please review the patient chart in SyncMed at your earliest convenience.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending provider assignment email:", error)
  }
}

export async function sendProviderPasswordResetEmail(payload: {
  to: string
  fullName: string
  otp: string
  resetUrl: string
}) {
  if (!process.env.BREVO_API_KEY) {
    console.log(
      `[MAIL FALLBACK] Brevo API key missing. Password reset for: ${payload.to} · OTP: ${payload.otp}`
    )
    return
  }

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: payload.to }],
      subject: "SyncMed Provider Password Reset",
      htmlContent: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; font-weight: 900; margin-bottom: 4px;">Password Reset Requested</h2>
          <p style="color: #67BA2E; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 0;">Credential Recovery</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${payload.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            A SyncMed administrator initiated a password reset for your provider account. Use the verification code below on the password reset page. This code expires in 15 minutes.
          </p>
          <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #67BA2E; margin: 24px 0; border-radius: 12px; border: 1px solid #f1f5f9;">
            ${payload.otp}
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Reset your password here: <a href="${payload.resetUrl}" target="_blank" rel="noreferrer">${payload.resetUrl}</a>
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 20px;">If you did not expect this email, contact SyncMed support immediately.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending provider password reset email:", error)
    console.log(`[MAIL ERROR] Password reset OTP for ${payload.to}: ${payload.otp}`)
  }
}

export async function sendProviderSecurityWarningEmail(payload: {
  to: string
  fullName: string
  loginUrl: string
}) {
  if (!process.env.BREVO_API_KEY) {
    console.log(`[MAIL FALLBACK] Brevo API key missing. Security warning for: ${payload.to}`)
    return
  }

  try {
    await apiInstance.sendTransacEmail({
      sender: SENDER,
      to: [{ email: payload.to }],
      subject: "[URGENT] Security Alert — SyncMed Provider Account",
      htmlContent: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 2px solid #fecaca; border-radius: 12px; background: #fffafa;">
          <h2 style="color: #991b1b; font-weight: 900; margin: 0 0 4px 0;">Security Alert</h2>
          <p style="color: #dc2626; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 0;">High Priority</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Dear <strong>${payload.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Our security team detected suspicious activity associated with your SyncMed provider account. As a precaution, we recommend that you sign in immediately, review recent account activity, and change your password if anything looks unfamiliar.
          </p>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 13px; font-weight: bold;">Recommended actions:</p>
            <ul style="margin: 0; padding-left: 18px; color: #7f1d1d; font-size: 13px; line-height: 1.7;">
              <li>Verify your recent login history</li>
              <li>Reset your password immediately</li>
              <li>Contact SyncMed support if you did not authorize recent activity</li>
            </ul>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Provider portal: <a href="${payload.loginUrl}" target="_blank" rel="noreferrer" style="color: #dc2626; font-weight: bold;">${payload.loginUrl}</a>
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 20px;">This alert was sent by a SyncMed administrator. Do not share your credentials with anyone.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending provider security warning email:", error)
  }
}
