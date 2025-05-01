
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Menu } from 'lucide-react';

export default function MenuPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
           <div className="flex items-center justify-between mb-4">
                 <Link href="/" passHref>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                 <div className="flex items-center gap-2">
                    <Menu className="h-6 w-6 text-primary" />
                    <CardTitle>App Menu</CardTitle>
                 </div>
                 <div className="w-8"></div> {/* Spacer */}
            </div>
          <CardDescription>
            This page represents the app's main navigation menu or sidebar content.
            Populate this with navigation links.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start justify-center space-y-2">
           <Button variant="link" className="p-0 h-auto">
             <Link href="/category/electronics">Electronics</Link>
           </Button>
            <Button variant="link" className="p-0 h-auto">
             <Link href="/category/clothing">Clothing</Link>
           </Button>
            <Button variant="link" className="p-0 h-auto">
             <Link href="/settings">Settings</Link>
           </Button>
           <Button variant="link" className="p-0 h-auto">
             <Link href="/support">Support</Link>
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    