import Sidebar from "@/lib/dashboard/Sidebar";
import DashboardHeader from "@/lib/dashboard/Header";

export default function DashboardShell({ children }) {
  return (
    <div className="flex min-h-full flex-1 bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
