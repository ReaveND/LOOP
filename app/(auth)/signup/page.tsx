"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Building2,
  Loader2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !workspaceName || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!acceptTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          workspaceName,
          password,
        }),
      });

      const data = await signupRes.json();

      if (!signupRes.ok) {
        throw new Error(data.message || 'Something went wrong during signup.');
      }

      // Automatically sign in the user after successful signup
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        setError('Account created, but failed to log in automatically. Please log in manually.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent">
        <div className="max-w-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center">
            <span className="text-3xl font-bold text-white">L</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">LOOP</h1>
            <p className="text-lg text-muted-foreground">
              Understand Your Customers Better
            </p>
          </div>
          <div className="pt-4 space-y-3 text-left">
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-muted-foreground">AI-powered feedback analysis</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-muted-foreground">Real-time insights and trends</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-muted-foreground">Collaborate with your team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo - Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-white">L</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">LOOP</h1>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>Join LOOP to analyze customer feedback with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                {/* Full Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-muted/50 border-muted"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Work Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-muted/50 border-muted"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Company Input */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-foreground">
                    Company Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Corp"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="pl-10 bg-muted/50 border-muted"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-muted/50 border-muted"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium text-muted-foreground cursor-pointer leading-tight"
                  >
                    I agree to the{' '}
                    <Link href="#" className="text-primary hover:text-primary/80">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-primary hover:text-primary/80">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {/* Sign Up Button */}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2 h-10" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-muted/30" disabled={isLoading}>
                  Google
                </Button>
                <Button variant="outline" className="bg-muted/30" disabled={isLoading}>
                  GitHub
                </Button>
              </div>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Start your free 14-day trial. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
