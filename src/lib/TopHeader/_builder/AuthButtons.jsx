import { AuthModal } from "@/components/auth";

export default function AuthButtons({ light = false, fill = false }) {
  return <AuthModal appearance={light ? "dark" : "light"} fill={fill} />;
}
