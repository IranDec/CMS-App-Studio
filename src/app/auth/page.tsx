// Designed by Mohammad Babaei (adschi.com)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link'; // Import Link
import { LandingHeader } from '@/components/landing/header'; // Reuse landing header
import { LandingFooter } from '@/components/landing/footer'; // Reuse landing footer

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For signup
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'

  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/studio'); // Redirect to studio if logged in
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    if (!auth) {
       setAuthError("Authentication service is not available.");
       setIsLoading(false);
       return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful", description: "Redirecting to the studio..." });
      router.push('/studio');
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Failed to log in. Please check your credentials.");
      toast({ variant: 'destructive', title: "Login Failed", description: error.message || "Please check your credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      toast({ variant: 'destructive', title: "Signup Failed", description: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    setAuthError(null);
     if (!auth) {
       setAuthError("Authentication service is not available.");
       setIsLoading(false);
       return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: "Signup Successful", description: "Redirecting to the studio..." });
      // User will be automatically logged in, trigger redirect via useEffect
    } catch (error: any) {
      console.error("Signup failed:", error);
      setAuthError(error.message || "Failed to create account. Please try again.");
      toast({ variant: 'destructive', title: "Signup Failed", description: error.message || "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading indicator while checking auth state initially
  if (authLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background">
              <p>Loading...</p> {/* Or use a Skeleton component */}
          </div>
      );
  }

   // Prevent rendering form if user is logged in (redirect should handle this, but as a safeguard)
   if (user) {
       return null; // Or a message "Already logged in, redirecting..."
   }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <LandingHeader /> {/* Reuse header */}
        <main className="flex-1 flex items-center justify-center py-12 px-4">
             <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="login">Login</TabsTrigger>
                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
               </TabsList>

               {/* Login Tab */}
               <TabsContent value="login">
                 <Card>
                   <CardHeader>
                     <CardTitle>Login</CardTitle>
                     <CardDescription>Access your CMS App Studio account.</CardDescription>
                   </CardHeader>
                   <form onSubmit={handleLogin}>
                     <CardContent className="space-y-4">
                       <div className="space-y-2">
                         <Label htmlFor="login-email">Email</Label>
                         <Input
                           id="login-email"
                           type="email"
                           placeholder="m@example.com"
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           disabled={isLoading}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="login-password">Password</Label>
                         <Input
                           id="login-password"
                           type="password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           disabled={isLoading}
                         />
                       </div>
                       {authError && activeTab === 'login' && (
                           <p className="text-sm text-destructive">{authError}</p>
                       )}
                     </CardContent>
                     <CardFooter>
                       <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? 'Logging in...' : 'Login'}
                       </Button>
                     </CardFooter>
                   </form>
                 </Card>
               </TabsContent>

               {/* Signup Tab */}
               <TabsContent value="signup">
                 <Card>
                   <CardHeader>
                     <CardTitle>Sign Up</CardTitle>
                     <CardDescription>Create a new account to start building.</CardDescription>
                   </CardHeader>
                   <form onSubmit={handleSignup}>
                     <CardContent className="space-y-4">
                       <div className="space-y-2">
                         <Label htmlFor="signup-email">Email</Label>
                         <Input
                           id="signup-email"
                           type="email"
                           placeholder="m@example.com"
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           disabled={isLoading}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="signup-password">Password</Label>
                         <Input
                           id="signup-password"
                           type="password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           disabled={isLoading}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="confirm-password">Confirm Password</Label>
                         <Input
                           id="confirm-password"
                           type="password"
                           required
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           disabled={isLoading}
                         />
                       </div>
                        {authError && activeTab === 'signup' && (
                            <p className="text-sm text-destructive">{authError}</p>
                        )}
                     </CardContent>
                     <CardFooter>
                       <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? 'Creating Account...' : 'Sign Up'}
                       </Button>
                     </CardFooter>
                   </form>
                 </Card>
               </TabsContent>
             </Tabs>
        </main>
         <LandingFooter /> {/* Reuse footer */}
      </div>
  );
}
