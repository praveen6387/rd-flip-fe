import { AuthModal } from "@/components/auth";

export default function AuthButtons({ light = false }) {
  return <AuthModal appearance={light ? "dark" : "light"} />;
}
