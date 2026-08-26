import Glows from "./_builder/Glows";
import Grid from "./_builder/Grid";
import Orb from "./_builder/Orb";
import Particles from "./_builder/Particles";

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-linear-to-br from-white via-[#faf1fb] to-slate-50">
      <Grid />
      <Glows />
      <Orb />
      <Particles />
    </div>
  );
}
