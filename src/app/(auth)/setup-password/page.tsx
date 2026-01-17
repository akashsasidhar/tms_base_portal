'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { validatePasswordStrength } from '@/utils/password.util';

// Validation schema
const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (password) => {
          const validation = validatePasswordStrength(password);
          return validation.isValid;
        },
        {
          message: 'Password must contain uppercase, lowercase, number, and special character',
        }
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>;

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupSuccess, setIsSetupSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (!token || !userId) {
      setError('Invalid or missing setup link.');
      toast.error('Invalid or missing setup link.');
    }
  }, [token, userId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SetupPasswordFormData>({
    resolver: zodResolver(setupPasswordSchema),
  });

  const onSubmit = async (data: SetupPasswordFormData) => {
    if (!token || !userId) {
      setError('Invalid or missing setup link.');
      toast.error('Invalid or missing setup link.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.setupPassword({
        token,
        user_id: userId,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      setIsSetupSuccess(true);
      toast.success('Your password has been set successfully!');
      reset();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        'Failed to set password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Setup password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !token && !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6" />
              Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please ensure you are using the correct and unexpired setup link.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSetupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Account Setup Successful!
            </CardTitle>
            <CardDescription>Your password has been set and your account is now verified.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You can now log in with your new password.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-6 w-6" />
            Set Up Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Welcome! Please set your password to complete your account setup
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          </CardContent>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  disabled={isSubmitting}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  disabled={isSubmitting}
                  placeholder="Confirm your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up Password...
                </>
              ) : (
                'Set Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
