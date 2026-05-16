"use server"

import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, subYears, isWithinInterval } from "date-fns"

export async function getAdminAnalytics(range: string, customStart?: Date, customEnd?: Date) {
  try {
    let startDate: Date
    let endDate: Date = endOfDay(new Date())
    let previousStartDate: Date
    let previousEndDate: Date

    if (range === "custom" && customStart && customEnd) {
      startDate = startOfDay(customStart)
      endDate = endOfDay(customEnd)
      const diff = endDate.getTime() - startDate.getTime()
      previousStartDate = new Date(startDate.getTime() - diff)
      previousEndDate = new Date(endDate.getTime() - diff)
    } else if (range === "30days") {
      startDate = startOfDay(subDays(new Date(), 30))
      previousStartDate = startOfDay(subDays(startDate, 30))
      previousEndDate = endOfDay(subDays(new Date(), 31))
    } else if (range === "1year") {
      startDate = startOfDay(subYears(new Date(), 1))
      previousStartDate = startOfDay(subYears(startDate, 1))
      previousEndDate = endOfDay(subDays(startDate, 1))
    } else {
      // Default 7 days
      startDate = startOfDay(subDays(new Date(), 7))
      previousStartDate = startOfDay(subDays(startDate, 7))
      previousEndDate = endOfDay(subDays(startDate, 1))
    }

    // 1. User Growth
    const [currentUsers, previousUsers] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.user.count({ where: { createdAt: { gte: previousStartDate, lte: previousEndDate } } })
    ])
    
    const userGrowth = previousUsers === 0 ? 100 : Math.round(((currentUsers - previousUsers) / previousUsers) * 100)

    // 2. Appointment Volume & Trends
    const appointments = await prisma.appointment.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true }
    })

    // Group by day for trend
    const dailyTrend: Record<string, number> = {}
    appointments.forEach(app => {
      const day = app.createdAt.toISOString().split('T')[0]
      dailyTrend[day] = (dailyTrend[day] || 0) + 1
    })

    // 3. Revenue Analytics
    const verifiedInvoices = await prisma.paymentInvoice.aggregate({
      where: { 
        status: "VERIFIED",
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    })

    const pendingInvoices = await prisma.paymentInvoice.aggregate({
      where: { 
        status: "PENDING",
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    })

    // 4. AI Stats
    const aiStats = await prisma.aiChatMessage.aggregate({
      where: { createdAt: { gte: startDate, lte: endDate } },
      _sum: { promptTokens: true, completionTokens: true }
    })

    // 5. Inquiry Conversion
    const totalInquiries = await prisma.consultationInquiry.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    })
    const processedInquiries = await prisma.consultationInquiry.count({
      where: { 
        status: { not: "PENDING" },
        createdAt: { gte: startDate, lte: endDate }
      }
    })

    // 6. Additional Requested Metrics
    const pendingAppointmentsCount = await prisma.appointment.count({
      where: { status: "PENDING", createdAt: { gte: startDate, lte: endDate } }
    })

    const totalAssessments = await prisma.assessment.count({
      where: { createdAt: { gte: startDate, lte: endDate } }
    })

    const totalActiveUsers = await prisma.user.count({ where: { isActive: true } })
    const recentUsers = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, firstName: true, lastName: true, image: true }
    })

    return {
      success: true,
      data: {
        users: { total: currentUsers, growth: userGrowth },
        appointments: { total: appointments.length, trend: dailyTrend, pending: pendingAppointmentsCount },
        revenue: { 
          verified: verifiedInvoices._sum.amount || 0, 
          pending: pendingInvoices._sum.amount || 0 
        },
        ai: { 
          promptTokens: aiStats._sum.promptTokens || 0, 
          completionTokens: aiStats._sum.completionTokens || 0,
          totalAssessments: totalAssessments
        },
        inquiries: { 
          total: totalInquiries, 
          conversion: totalInquiries === 0 ? 0 : Math.round((processedInquiries / totalInquiries) * 100) 
        },
        activeUsers: {
          total: totalActiveUsers,
          recent: recentUsers
        }
      }
    }

  } catch (error) {
    console.error("[ANALYTICS_ERROR]:", error)
    return { success: false, error: "Failed to fetch analytics." }
  }
}
