"use server";

import prisma from "@/lib/prisma";
import { sendLeadConfirmationEmail, sendLeadNotificationEmail } from "@/lib/mail";
import { z } from "zod";

const InquirySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  referralSource: z.string().optional(),
  inquiryDetails: z.string().optional(),
});

export async function submitInquiryAction(formData: FormData) {
  try {
    const rawData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      referralSource: formData.get("referralSource"),
      inquiryDetails: formData.get("inquiryDetails"),
    };

    const validatedData = InquirySchema.parse(rawData);

    await prisma.consultationInquiry.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        referralSource: validatedData.referralSource,
        inquiryDetails: validatedData.inquiryDetails,
        status: "PENDING",
      },
    });

    const fullName = `${validatedData.firstName} ${validatedData.lastName}`;
    const messageParts = [
      validatedData.inquiryDetails,
      validatedData.referralSource
        ? `Referral source: ${validatedData.referralSource}`
        : null,
    ].filter(Boolean);
    const message =
      messageParts.length > 0
        ? messageParts.join("\n\n")
        : "Consultation inquiry submitted via website.";

    try {
      await Promise.all([
        sendLeadNotificationEmail({
          name: fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          type: "general",
          message,
        }),
        sendLeadConfirmationEmail({
          name: fullName,
          email: validatedData.email,
          type: "general",
        }),
      ]);
    } catch (emailError) {
      console.error("Consultation inquiry email error:", emailError);
    }

    return { success: true, message: "Your request has been securely transmitted." };
  } catch (error) {
    console.error("Consultation Inquiry Error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to transmit request. Please try again." };
  }
}
