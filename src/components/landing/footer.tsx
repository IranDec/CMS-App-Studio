// Designed by Mohammad Babaei (adschi.com)
import Link from "next/link";
import { Button } from "../ui/button";
import { Rocket } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/50">
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CMS App Studio. Designed by <a href="https://adschi.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Mohammad Babaei (adschi.com)</a>. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6 items-center">
        <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
          Terms
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
          Privacy
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link href="/studio">
             <Rocket className="mr-1 h-3 w-3"/> Go to Studio
          </Link>
        </Button>
      </nav>
    </footer>
  );
}
