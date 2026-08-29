import SidebarBrand from "./_builder/SidebarBrand";
import SidebarNav from "./_builder/SidebarNav";

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white">
      <SidebarBrand />
      <SidebarNav />
    </aside>
  );
}
