// Designed by Mohammad Babaei (adschi.com)
"use client"

import React, { useState, useEffect } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render NextThemesProvider on the client after mount
  if (!isMounted) {
     // Render children directly on the server to avoid mismatch
     // You might want a loading state or null instead depending on UX needs
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
