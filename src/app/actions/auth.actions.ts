"use server"

import prisma from "@/lib/prisma"
import { generateSecret, generateURI, verify } from "otplib"
import QRCode from "qrcode"
import bcrypt from "bcryptjs"

export async function generateMfaSecretAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error("User not found")

    const secret = generateSecret()
    const otpauthUrl = generateURI({
      secret,
      issuer: "Healthcare EMR",
      label: email,
      algorithm: "sha1",
      digits: 6,
      period: 30
    })
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    await prisma.user.update({
      where: { email },
      data: { mfaSecret: secret, mfaEnabled: false }
    })

    return { success: true, secret, qrCodeDataUrl }
  } catch (error: any) {
    return { success: false, error: "Failed to generate MFA token" }
  }
}

export async function verifyAndEnableMfaAction(email: string, token: string) {
  try {
    if (!token || token.length !== 6) return { success: false, error: "6-digit code required." }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.mfaSecret) return { success: false, error: "Setup not found" }

    // verify() returns { valid: boolean }. We must check result.valid explicitly.
    const result = await verify({
      token,
      secret: user.mfaSecret
    })
    
    if (result.valid === true) {
      await prisma.user.update({
        where: { email },
        data: { mfaEnabled: true }
      })
      return { success: true }
    }
    
    return { success: false, error: "Invalid code. Please try again." }
  } catch (error) {
    return { success: false, error: "System Error" }
  }
}

export async function verifyMfaLoginAction(email: string, token: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.mfaSecret || !user.mfaEnabled) return { success: false, error: "MFA not enabled" }

    const result = await verify({
      token,
      secret: user.mfaSecret
    })
    
    return result.valid === true ? { success: true } : { success: false, error: "Invalid code" }
  } catch (error) {
    return { success: false, error: "Verification failed" }
  }
}

/** Clears auth cookies server-side before a fresh sign-in (fixes ERR_RESPONSE_HEADERS_TOO_BIG). */
export async function clearAuthSessionCookiesAction() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const names = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
  ]
  for (const name of names) {
    cookieStore.delete(name)
  }
  for (let i = 0; i < 8; i++) {
    cookieStore.delete(`authjs.session-token.${i}`)
    cookieStore.delete(`__Secure-authjs.session-token.${i}`)
  }
  return { success: true }
}

export async function preLoginCheckAction(email: string, password?: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "Invalid credentials" };

    // CRITICAL SECURITY: Verify password before returning MFA state or Role
    if (password) {
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) return { success: false, error: "Invalid credentials" };
    }

    return { 
      success: true, 
      mfaEnabled: user.mfaEnabled || false,
      role: user.role // Send role safely to frontend to bypass NextAuth cache delay
    };
  } catch (error) {
    return { success: false, mfaEnabled: false };
  }
}

/**
 * Generate 6-digit OTP for password reset
 */
export async function sendPasswordResetOTP(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "If this email is registered, you will receive an OTP." };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiry
      }
    });

    // Send the actual email
    const { sendOTPEmail } = await import("@/lib/mail")
    await sendOTPEmail(email, otp);

    console.log(`[AUTH] Password Reset OTP for ${email}: ${otp}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send OTP" };
  }
}

/**
 * Verify OTP code
 */
export async function verifyResetOTP(email: string, code: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== code) return { success: false, error: "Invalid code" };

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return { success: false, error: "Code expired" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Update password using Bcrypt
 */
export async function updatePasswordAction(email: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "User not found" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        resetToken: null, // Clear the code
        resetTokenExpiry: null
      }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update password" };
  }
}
