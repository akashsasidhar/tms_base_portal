'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { validatePasswordStrength } from '@/utils/password.util';

// Validation schema
const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z
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
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: 'New password must be different from current password',
    path: ['new_password'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);

    try {
      await authService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password, // Included for frontend validation, backend only needs old_password and new_password
      });

      toast.success('Password changed successfully');
      reset();
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        'Failed to change password. Please try again.';
      toast.error(errorMessage);
      console.error('Password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Change Password</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Update your account password to keep your account secure
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Enter your current password and choose a new secure password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Current Password *</Label>
              <div className="relative">
                <Input
                  id="old_password"
                  type={showOldPassword ? 'text' : 'password'}
                  {...register('old_password')}
                  disabled={isSubmitting}
                  placeholder="Enter your current password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isSubmitting}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.old_password && (
                <p className="text-sm text-destructive">{errors.old_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('new_password')}
                  disabled={isSubmitting}
                  placeholder="Enter your new password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isSubmitting}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  disabled={isSubmitting}
                  placeholder="Confirm your new password"
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
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button type="button" variant="outline" disabled={isSubmitting} className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
