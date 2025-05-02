// Designed by Mohammad Babaei (adschi.com)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mountain } from "lucide-react"; // Or your logo component

export function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <Mountain className="h-6 w-6 text-primary" />
        <span className="sr-only">CMS App Studio</span>
         <span className="ml-2 text-lg font-semibold text-primary">CMS App Studio</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4 text-foreground" prefetch={false}>
          Features
        </Link>
        {/* Add other links like Pricing, Docs if needed */}
         <Button variant="outline" size="sm" asChild>
           <Link href="/auth">Login</Link>
         </Button>
        <Button size="sm" asChild>
          <Link href="/auth">Sign Up</Link>
        </Button>
         <Button variant="secondary" size="sm" asChild>
             <Link href="/studio">Enter Studio</Link>
         </Button>
      </nav>
    </header>
  );
}
