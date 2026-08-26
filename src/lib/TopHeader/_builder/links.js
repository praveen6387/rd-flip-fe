export const LINKS = [
  { href: "#home", label: "Home" },
  // { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#plans", label: "Plans" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

export function sectionHref(pathname, hash) {
  return pathname === "/" ? hash : `/${hash}`;
}
