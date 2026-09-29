import { Orders } from "@/components/dashboard";
import { AdminGuard } from "@/lib/dashboard";
import { listAdminOrders } from "@/lib/api/server/orders";

export const metadata = {
  title: "Orders | RD Flip",
};

export default async function OrdersPage() {
  const { orders, error, unauthorized } = await listAdminOrders();

  return (
    <AdminGuard>
      <Orders
        orders={orders}
        error={unauthorized ? "Please sign in again." : error}
      />
    </AdminGuard>
  );
}
