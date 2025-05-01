
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
           <div className="flex items-center justify-between mb-4">
                 <Link href="/" passHref>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                 <div className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <CardTitle>Shopping Cart</CardTitle>
                 </div>
                 <div className="w-8"></div> {/* Spacer */}
            </div>
          <CardDescription>
            This is where the user's shopping cart items will be displayed.
            Implement fetching cart data and item management.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
          <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Your cart is currently empty.</p>
          <Link href="/" passHref>
            <Button variant="default">Continue Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

    