'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { contactTypeService } from '@/services/contactType.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactType } from '@/types/contact.types';

// Validation schema
const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    contacts: z
      .array(
        z.object({
          contact_type_id: z.string().min(1, 'Contact type is required'),
          contact: z.string().min(1, 'Contact is required'),
        })
      )
      .min(1, 'At least one contact is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [loadingContactTypes, setLoadingContactTypes] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      contacts: [{ contact_type_id: '', contact: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  // Fetch contact types on mount
  useEffect(() => {
    const fetchContactTypes = async () => {
      try {
        const types = await contactTypeService.getAll();
        setContactTypes(types.filter((t) => t.is_active));
      } catch (error) {
        toast.error('Failed to load contact types');
        console.error('Error fetching contact types:', error);
      } finally {
        setLoadingContactTypes(false);
      }
    };

    fetchContactTypes();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    try {
      const { confirm_password, ...registerData } = data;
      await authService.register(registerData);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your information to create a new account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register('username')}
                disabled={isSubmitting}
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                disabled={isSubmitting}
                placeholder="John"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register('last_name')}
              disabled={isSubmitting}
              placeholder="Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isSubmitting}
                placeholder="Min 8 characters"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password *</Label>
              <Input
                id="confirm_password"
                type="password"
                {...register('confirm_password')}
                disabled={isSubmitting}
                placeholder="Confirm password"
              />
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Contacts *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ contact_type_id: '', contact: '' })}
                disabled={isSubmitting || loadingContactTypes}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1">
                  <Controller
                    name={`contacts.${index}.contact_type_id`}
                    control={control}
                    render={({ field: selectField }) => (
                      <Select
                        value={selectField.value}
                        onValueChange={selectField.onChange}
                        disabled={isSubmitting || loadingContactTypes}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.contact_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.contacts?.[index]?.contact_type_id && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.contacts[index]?.contact_type_id?.message}
                    </p>
                  )}
                </div>

                <div className="flex-[2]">
                  <Input
                    {...register(`contacts.${index}.contact`)}
                    disabled={isSubmitting}
                    placeholder="email@example.com or +1234567890"
                  />
                  {errors.contacts?.[index]?.contact && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.contacts[index]?.contact?.message}
                    </p>
                  )}
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.contacts && typeof errors.contacts.message === 'string' && (
              <p className="text-sm text-destructive">{errors.contacts.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting || loadingContactTypes}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
