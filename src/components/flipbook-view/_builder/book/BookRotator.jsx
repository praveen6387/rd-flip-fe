"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BookInteractionContext } from "./interaction";

export default function BookRotator({ children, bookRotationRef, dragRef }) {
  const groupRef = useRef(null);

  const interaction = useMemo(
    () => ({
      dragRef,
    }),
    [dragRef]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = bookRotationRef.current;
  });

  return (
    <BookInteractionContext.Provider value={interaction}>
      <group ref={groupRef}>{children}</group>
    </BookInteractionContext.Provider>
  );
}
