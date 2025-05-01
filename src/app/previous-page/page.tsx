
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function PreviousPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
            <div className="flex items-center justify-between mb-4">
                 <Link href="/" passHref>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                 <CardTitle>Previous Page</CardTitle>
                 <div className="w-8"></div> {/* Spacer */}
            </div>
          <CardDescription>
            This is a placeholder representing a generic previous screen.
            In a real app, the back button would navigate to the actual previous route in the history stack.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <p className="text-muted-foreground">Content of the previous page would be here.</p>
           <Link href="/" passHref>
             <Button variant="default">Go Back Home</Button>
           </Link>
        </CardContent>
      </Card>
    </div>
  );
}

    