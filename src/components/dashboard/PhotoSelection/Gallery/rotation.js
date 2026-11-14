export function rotationClass(rotation) {
  const turn = Number(rotation) || 0;
  if (turn === 90) return "rotate-90 scale-[0.75]";
  if (turn === 180) return "rotate-180";
  if (turn === 270) return "-rotate-90 scale-[0.75]";
  return "";
}
