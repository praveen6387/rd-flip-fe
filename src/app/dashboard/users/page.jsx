import { Users } from "@/components/dashboard";
import { AdminGuard } from "@/lib/dashboard";
import { listAdminUsers } from "@/lib/api/server/users";

export const metadata = {
  title: "Users | RD Flip",
};

export default async function UsersPage() {
  const { users, error, unauthorized } = await listAdminUsers();

  return (
    <AdminGuard>
      <Users
        users={users}
        error={unauthorized ? "Please sign in again." : error}
      />
    </AdminGuard>
  );
}
