// Designed by Mohammad Babaei (adschi.com)
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CMS App Studio. Designed by Mohammad Babaei (adschi.com). All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
          Terms of Service
        </Link>
        <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
          Privacy
        </Link>
        <Link href="/studio" className="text-xs hover:underline underline-offset-4 text-primary" prefetch={false}>
          Go to Studio
        </Link>
      </nav>
    </footer>
  );
}
