
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Import directly from /sans
import { GeistMono } from 'geist/font/mono'; // Import directly from /mono
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { ThemeProvider } from '@/components/theme-provider'; // Import ThemeProvider

// Note: Unlike next/font/google, geist/font exports the variables directly.
// We don't call GeistSans() or GeistMono().
// const geistSans = GeistSans({ // NO LONGER NEEDED
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = GeistMono({ // NO LONGER NEEDED
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'CMS App Studio', // Updated App Name
  description: 'Visually build mobile apps for your CMS.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning to ignore browser extension modifications
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} // Use imported objects directly
        // Remove suppressHydrationWarning from body as it's on html
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster /> {/* Add Toaster component here */}
        </ThemeProvider>
      </body>
    </html>
  );
}
