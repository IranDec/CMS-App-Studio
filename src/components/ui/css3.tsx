
import React from 'react';
import { cn } from "@/lib/utils";

export const Css3 = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-css3", className)} // Mimic lucide class structure
      {...props}
    >
       {/* Simple CSS3-like shape */}
       <path d="M4 3l1.28 14.195L12 21l6.72-3.805L20 3H4zm11.5 6.5H8.5l.3 3h6.4l-.3 3-3.4.9-3.4-.9-.2-2h-3l.4 5.3L12 19l5.1-1.7L18 7h-6.5v2.5z"/>
    </svg>
  )
);
Css3.displayName = 'Css3';
