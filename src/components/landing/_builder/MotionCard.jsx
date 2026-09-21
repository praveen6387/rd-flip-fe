"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1];

function MotionCardInner({
  children,
  className,
  index = 0,
  as = "div",
  hover = true,
  ...props
}) {
  const Comp = m[as] ?? m.div;

  return (
    <Comp
      className={cn(
        hover && "transition-transform duration-200 will-change-transform hover:-translate-y-1",
        className
      )}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay: Math.min(index * 0.12, 0.6),
        ease,
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

export default function MotionCard(props) {
  return <MotionCardInner {...props} />;
}
