import {
  getAdminDashboardStats,
  getAdminDashboardListData,
} from "@/lib/admin-dashboard-data"
import { AdminDashboardStatsClient } from "./AdminDashboardStatsClient"

export async function AdminDashboardStats() {
  const [statsData, listData] = await Promise.all([
    getAdminDashboardStats(),
    getAdminDashboardListData(),
  ])

  return (
    <AdminDashboardStatsClient statsData={statsData} listData={listData} />
  )
}

export { DashboardStatsGridSkeleton as AdminDashboardStatsSkeleton } from "@/components/dashboard/DashboardStatsGrid"
