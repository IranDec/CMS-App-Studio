// Designed by Mohammad Babaei (adschi.com)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mountain, LogIn, UserPlus, Rocket } from "lucide-react"; // Added more icons
import { cn } from "@/lib/utils"; // Import cn utility

export function LandingHeader() {
  return (
    <header className={cn(
        "px-4 lg:px-6 h-16 flex items-center sticky top-0 z-50 w-full",
        "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" // Enhanced styling
    )}>
      <Link href="/" className="flex items-center justify-center gap-2 mr-6" prefetch={false}>
        <Mountain className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold text-primary whitespace-nowrap">CMS App Studio</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground underline-offset-4 hover:underline hidden sm:inline-block" prefetch={false}>
          Features
        </Link>
        {/* Add other links like Pricing, Docs if needed */}
         <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
           <Link href="/auth">
             <LogIn className="mr-1 h-4 w-4"/>
             Login
           </Link>
         </Button>
        <Button size="sm" asChild className="shadow-sm">
          <Link href="/auth">
             <UserPlus className="mr-1 h-4 w-4"/>
            Sign Up
          </Link>
        </Button>
         <Button variant="secondary" size="sm" asChild className="hidden lg:inline-flex shadow-sm">
             <Link href="/studio">
                 <Rocket className="mr-1 h-4 w-4"/>
                 Enter Studio
            </Link>
         </Button>
      </nav>
    </header>
  );
}
