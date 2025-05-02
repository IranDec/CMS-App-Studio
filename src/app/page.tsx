// Designed by Mohammad Babaei (adschi.com)
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/landing/header';
import { LandingFooter } from '@/components/landing/footer';
import { CheckCircle, MousePointerSquareDashed, Image as ImageIcon, Rows, Type, LayoutGrid, Palette, Bot, Database, Save, MonitorSmartphone, Play, LogIn } from 'lucide-react'; // Added more icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Use Card components


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
                 alt="CMS App Studio Interface Preview"
                 width={600}
                 height={400}
                 priority // Load hero image faster
                 className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg border border-border"
                 data-ai-hint="app builder interface modern"
               />
              <div className="flex flex-col justify-center space-y-6"> {/* Increased spacing */}
                <div className="space-y-4"> {/* Increased spacing */}
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent"> {/* Enhanced gradient */}
                    Visually Build Mobile Apps for Your CMS
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed"> {/* Adjusted text size/leading */}
                    CMS App Studio empowers you to create stunning mobile interfaces for your content management system with an intuitive drag-and-drop builder. No coding required.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row"> {/* Increased gap */}
                  <Button size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow">
                    <Link href="/studio">Get Started Now</Link>
                  </Button>
                   <Button size="lg" variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
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
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12"> {/* Added margin-bottom */}
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground shadow-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary">Everything You Need to Build Beautiful Apps</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From intuitive design tools to powerful AI assistance, CMS App Studio provides a comprehensive solution for mobile app creation.
                </p>
              </div>
            </div>
            {/* Use Card components for features */}
            <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
              <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
                  <CardHeader className="pb-4">
                     <CardTitle className="flex items-center gap-2 text-xl"><MousePointerSquareDashed className="text-primary h-6 w-6"/> Drag & Drop Builder</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <CardDescription>Visually assemble your app interface by dragging pre-built widgets onto a live preview.</CardDescription>
                  </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
                 <CardHeader className="pb-4">
                   <CardTitle className="flex items-center gap-2 text-xl"><MonitorSmartphone className="text-primary h-6 w-6"/> Real-time Preview</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <CardDescription>See your changes instantly reflected on a realistic phone mockup.</CardDescription>
                 </CardContent>
               </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl"><Palette className="text-primary h-6 w-6"/> Widget Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Easily customize the appearance and behavior of each widget.</CardDescription>
                  </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
                 <CardHeader className="pb-4">
                   <CardTitle className="flex items-center gap-2 text-xl"><Bot className="text-primary h-6 w-6"/> AI Assistance</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <CardDescription>Leverage AI for content generation and layout suggestions to speed up your workflow.</CardDescription>
                 </CardContent>
              </Card>
               <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
                 <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl"><LayoutGrid className="text-primary h-6 w-6"/> Theming & Templates</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <CardDescription>Apply pre-defined themes or start quickly with application templates (Store, Blog).</CardDescription>
                 </CardContent>
               </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
                 <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl"><Database className="text-primary h-6 w-6"/> CMS Ready</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <CardDescription>Designed to connect with popular CMS platforms like Prestashop, WooCommerce, and more.</CardDescription>
                 </CardContent>
               </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-background"> {/* Added background */}
          <div className="container grid items-center justify-center gap-6 px-4 text-center md:px-6"> {/* Increased gap */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
                Ready to Build Your Mobile App?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today and start designing visually stunning and functional mobile apps connected to your CMS.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-3 sm:space-y-0 sm:flex sm:space-x-4 sm:justify-center"> {/* Adjusted layout for buttons */}
                <Button size="lg" asChild className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                    <Link href="/studio">
                        <Play className="mr-2 h-5 w-5" /> Start Building Free
                    </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
                    <Link href="/auth">
                        <LogIn className="mr-2 h-5 w-5" /> Login / Sign Up
                    </Link>
                 </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

