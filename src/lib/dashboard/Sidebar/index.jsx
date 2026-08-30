import SidebarBrand from "./_builder/SidebarBrand";
import SidebarNav from "./_builder/SidebarNav";
import SidebarTwinkles from "./_builder/SidebarTwinkles";

export default function Sidebar() {
  return (
    <aside className="relative hidden h-full w-72 shrink-0 flex-col overflow-hidden border-r border-white/15 bg-[#1a1614] shadow-[8px_0_32px_-12px_rgba(26,22,20,0.45)] backdrop-blur-2xl md:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_22%,transparent_45%,rgba(244,239,230,0.06)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 z-0 size-56 -translate-x-1/2 rounded-full bg-rose-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 -left-10 z-0 size-44 rounded-full bg-sky-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
      />
      <SidebarTwinkles />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <SidebarBrand />
        <SidebarNav />
        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <p className="text-[11px] font-medium tracking-[0.18em] text-stone-400 uppercase">
            Studio workspace
          </p>
        </div>
      </div>
    </aside>
  );
}
