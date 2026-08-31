"use client";

import { createContext, useContext } from "react";

export const BookInteractionContext = createContext(null);

export function useBookInteraction() {
  return useContext(BookInteractionContext);
}
