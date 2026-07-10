import { getProductsFromDb, getOrders } from "@/lib/db"
import { AdminDashboard } from "@/components/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const products = await getProductsFromDb()
  const orders = await getOrders()

  return <AdminDashboard initialProducts={products} initialOrders={orders} />
}
