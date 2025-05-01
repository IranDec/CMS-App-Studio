
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
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
                 <CardTitle>Authentication</CardTitle>
                 <div className="w-8"></div> {/* Spacer */}
            </div>
          <CardDescription>
            This is a placeholder page for user login and registration.
            Build out your authentication forms and logic here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <p className="text-muted-foreground">Authentication UI goes here...</p>
          <Button variant="secondary" disabled>Login (Coming Soon)</Button>
          <Button variant="link" disabled>Register (Coming Soon)</Button>
        </CardContent>
      </Card>
    </div>
  );
}

    