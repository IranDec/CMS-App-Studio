// Designed by Mohammad Babaei (adschi.com)
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/landing/header';
import { LandingFooter } from '@/components/landing/footer';
import { CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <Image
                 src="https://picsum.photos/seed/landing_hero/600/400"
                 alt="Hero Image"
                 width={600}
                 height={400}
                 className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
                 data-ai-hint="app builder interface modern"
               />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Visually Build Mobile Apps for Your CMS
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CMS App Studio empowers you to create stunning mobile interfaces for your content management system with an intuitive drag-and-drop builder. No coding required.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/studio">Get Started Now</Link>
                  </Button>
                   <Button size="lg" variant="outline" asChild>
                     <Link href="#features">Learn More</Link>
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Build Beautiful Apps</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From intuitive design tools to powerful AI assistance, CMS App Studio provides a comprehensive solution for mobile app creation.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none pt-12">
              <div className="grid gap-1 rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/>Drag & Drop Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Visually assemble your app interface by dragging pre-built widgets onto a live preview.
                </p>
              </div>
              <div className="grid gap-1 rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/>Real-time Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See your changes instantly reflected on a realistic phone mockup.
                </p>
              </div>
              <div className="grid gap-1 rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/>Widget Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Easily customize the appearance and behavior of each widget.
                </p>
              </div>
              <div className="grid gap-1 rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/>AI Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Leverage AI for content generation and layout suggestions to speed up your workflow.
                </p>
              </div>
              <div className="grid gap-1 rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                 <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/>Theming & Templates</h3>
                 <p className="text-sm text-muted-foreground">
                   Apply pre-defined themes or start quickly with application templates (Store, Blog).
                 </p>
              </div>
               <div className="grid gap-1 rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                 <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/>CMS Ready</h3>
                 <p className="text-sm text-muted-foreground">
                   Designed to connect with popular CMS platforms like Prestashop, WooCommerce, and more.
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to build your mobile app?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today and start designing visually stunning and functional mobile apps connected to your CMS.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-x-2">
                <Button size="lg" asChild>
                    <Link href="/studio">Start Building Free</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                    <Link href="/auth">Login / Sign Up</Link>
                 </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
