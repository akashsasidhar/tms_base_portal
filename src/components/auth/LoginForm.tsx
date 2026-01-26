'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Validation schema
const loginSchema = z.object({
  contact: z.string().email('Please enter a valid email address').min(1, 'Primary email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const { login, isLoading, error, clearError } = useAuth();
  const { requiresVerification, unverifiedEmail, clearVerificationState } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>('/dashboard');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Get redirect URL from query params on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        setRedirectUrl(redirect);
      }
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearError();
    clearVerificationState();

    try {
      await login(data.contact, data.password);
      
      // Use window.location for full page reload to ensure cookies are read
      // This ensures the middleware can properly detect the authentication cookies
      // and the session is maintained across the redirect
      window.location.href = redirectUrl;
    } catch (error) {
      // Error is handled in the store
      console.error('Login error:', error);
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsResending(true);
    try {
      console.log('[LoginForm] Resending verification email to:', unverifiedEmail);
      await authService.resendVerification(unverifiedEmail);
      console.log('[LoginForm] Verification email sent successfully');
      toast.success('Verification email sent! Please check your email to verify your account and set up your password.');
    } catch (error) {
      console.error('[LoginForm] Error resending verification email:', error);
      const errorResponse = error as { response?: { data?: { message?: string; errors?: string[] } } };
      const errorMessage = errorResponse?.response?.data?.message || 'Failed to send verification email';
      const errorDetails = errorResponse?.response?.data?.errors || [];
      
      // Show detailed error message
      if (errorDetails.length > 0) {
        toast.error(`${errorMessage}: ${errorDetails.join(', ')}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Clear verification state when component unmounts or email changes
  useEffect(() => {
    return () => {
      clearVerificationState();
    };
  }, [clearVerificationState]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {requiresVerification && unverifiedEmail && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Account Not Verified
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your account has not been verified yet. Please verify your email address to complete your registration and set up your password.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full sm:w-auto border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    We'll send a verification email to <strong>{unverifiedEmail}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="contact">Primary Email</Label>
            <Input
              id="contact"
              type="email"
              placeholder="your.primary@email.com"
              {...register('contact')}
              disabled={isSubmitting || isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Use your primary email address to login
            </p>
            {errors.contact && (
              <p className="text-sm text-destructive">{errors.contact.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              disabled={isSubmitting || isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
