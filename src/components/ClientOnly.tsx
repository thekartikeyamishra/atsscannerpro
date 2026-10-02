'use client';
// components/ClientOnly.tsx
// Renders children ONLY on the client, never during SSR.
// Use this to wrap any content that:
//  - Uses Math.random(), Date.now() during render
//  - Reads window/navigator/document during render
//  - Has content that differs between server and client
//
// Example usage:
//   <ClientOnly fallback={<span>2025</span>}>
//     <span>{new Date().getFullYear()}</span>
//   </ClientOnly>

import { useState, useEffect, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  /** Optional skeleton shown during SSR and before hydration */
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}