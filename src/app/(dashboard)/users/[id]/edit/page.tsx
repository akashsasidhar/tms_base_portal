'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useUpdateUser, useAddContact, useRemoveContact, useUpdateContact } from '@/hooks/useUsers';
import { usePermissions } from '@/hooks/usePermissions';
import { contactTypeService } from '@/services/contactType.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import type { ContactType } from '@/types/contact.types';
import type { UserContact } from '@/types/user.types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validation schema matching backend
const updateUserSchema = z.object({
  first_name: z.string().max(100, 'First name must not exceed 100 characters').optional().nullable(),
  last_name: z.string().max(100, 'Last name must not exceed 100 characters').optional().nullable(),
  is_active: z.boolean().optional(),
  primary_email: z.string().email('Invalid email address').min(1, 'Email is required'),
  primary_mobile: z.string().min(1, 'Mobile number is required'),
  additional_contacts: z
    .array(
      z.object({
        contact_type_id: z.string().optional(),
        contact: z.string().optional(),
      }),
    )
    .optional(),
}).refine(
  data => {
    // Validate additional contacts: if either field is filled, both must be filled
    if (data.additional_contacts && data.additional_contacts.length > 0) {
      for (const contact of data.additional_contacts) {
        const hasType = contact.contact_type_id && contact.contact_type_id.trim() !== '';
        const hasContact = contact.contact && contact.contact.trim() !== '';
        
        // If one is filled, both must be filled
        if (hasType && !hasContact) {
          return false;
        }
        if (hasContact && !hasType) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: "Both contact type and contact value are required if adding an additional contact",
    path: ["additional_contacts"],
  },
);

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data: user, isLoading, error } = useUser(params.id);
  const updateUserMutation = useUpdateUser();
  const addContactMutation = useAddContact();
  const removeContactMutation = useRemoveContact();
  const updateContactMutation = useUpdateContact();
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [loadingContactTypes, setLoadingContactTypes] = useState(true);

  const canUpdate = hasPermission('users:update');

  // Fetch contact types on mount
  useEffect(() => {
    const fetchContactTypes = async () => {
      try {
        const types = await contactTypeService.getAll();
        setContactTypes(types.filter(t => t.is_active));
      } catch (error) {
        toast.error('Failed to load contact types');
        console.error('Error fetching contact types:', error);
      } finally {
        setLoadingContactTypes(false);
      }
    };

    fetchContactTypes();
  }, []);

  // Redirect if ID is invalid
  useEffect(() => {
    if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
      router.replace('/users');
    }
  }, [params.id, router]);

  // Don't render if ID is invalid
  if (params.id === 'new' || !UUID_REGEX.test(params.id)) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  if (!canUpdate) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to edit users.</p>
        </div>
      </div>
    );
  }

  // Get primary email contact (returns the contact object, not just the value)
  const getPrimaryEmailContact = (): UserContact | undefined => {
    if (!user?.contacts || user.contacts.length === 0) return undefined;
    // First try to find primary email
    const primaryEmail = user.contacts.find(
      c => c.contact_type?.toLowerCase() === 'email' && c.is_primary
    );
    if (primaryEmail) return primaryEmail;
    // Fallback to first email if no primary
    return user.contacts.find(c => c.contact_type?.toLowerCase() === 'email');
  };

  // Get primary mobile contact (returns the contact object, not just the value)
  const getPrimaryMobileContact = (): UserContact | undefined => {
    if (!user?.contacts || user.contacts.length === 0) return undefined;
    // First try to find primary mobile
    const primaryMobile = user.contacts.find(
      c => c.contact_type?.toLowerCase() === 'mobile' && c.is_primary
    );
    if (primaryMobile) return primaryMobile;
    // Fallback to first mobile if no primary
    return user.contacts.find(c => c.contact_type?.toLowerCase() === 'mobile');
  };

  // Get primary email value
  const getPrimaryEmail = (): string => {
    const emailContact = getPrimaryEmailContact();
    return emailContact?.contact || '';
  };

  // Get primary mobile value
  const getPrimaryMobile = (): string => {
    const mobileContact = getPrimaryMobileContact();
    return mobileContact?.contact || '';
  };

  // Get additional contacts (exclude ALL email and mobile contacts - they're handled by primary fields)
  const getAdditionalContacts = (): Array<{ id?: string; contact_type_id: string; contact: string }> => {
    if (!user?.contacts || user.contacts.length === 0) return [];
    
    // Exclude ALL email and mobile type contacts - they're handled by primary email/mobile fields
    return user.contacts
      .filter(c => {
        const type = c.contact_type?.toLowerCase();
        // Exclude all email and mobile contacts (primary or not)
        return type !== 'email' && type !== 'mobile';
      })
      .map(c => ({
        id: c.id,
        contact_type_id: c.contact_type_id,
        contact: c.contact,
      }));
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      is_active: user?.is_active ?? true,
      primary_email: '',
      primary_mobile: '',
      additional_contacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additional_contacts',
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user && contactTypes.length > 0) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active ?? true,
        primary_email: getPrimaryEmail(),
        primary_mobile: getPrimaryMobile(),
        additional_contacts: getAdditionalContacts(),
      });
    }
  }, [user, contactTypes, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    try {
      // Update basic user info
      await updateUserMutation.mutateAsync({
        id: params.id,
        data: {
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          is_active: data.is_active,
        },
      });

      // Find email and mobile contact type IDs
      const emailType = contactTypes.find(t => t.contact_type.toLowerCase() === 'email');
      const mobileType = contactTypes.find(t => t.contact_type.toLowerCase() === 'mobile');
      
      if (!emailType || !mobileType) {
        toast.error('Email or mobile contact type not found. Please contact administrator.');
        return;
      }

      // Update primary email
      const currentEmail = getPrimaryEmail();
      const primaryEmailContact = getPrimaryEmailContact();
      if (data.primary_email !== currentEmail && data.primary_email.trim() !== '') {
        if (primaryEmailContact) {
          // Update existing primary email contact
          await updateContactMutation.mutateAsync({
            userId: params.id,
            contactId: primaryEmailContact.id,
            contactData: { contact: data.primary_email },
          });
        } else {
          // Add new email contact if it doesn't exist
          await addContactMutation.mutateAsync({
            userId: params.id,
            contactData: {
              contact_type_id: emailType.id,
              contact: data.primary_email,
            },
          });
        }
      }

      // Update primary mobile
      const currentMobile = getPrimaryMobile();
      const primaryMobileContact = getPrimaryMobileContact();
      if (data.primary_mobile !== currentMobile && data.primary_mobile.trim() !== '') {
        if (primaryMobileContact) {
          // Update existing primary mobile contact
          await updateContactMutation.mutateAsync({
            userId: params.id,
            contactId: primaryMobileContact.id,
            contactData: { contact: data.primary_mobile },
          });
        } else {
          // Add new mobile contact if it doesn't exist
          await addContactMutation.mutateAsync({
            userId: params.id,
            contactData: {
              contact_type_id: mobileType.id,
              contact: data.primary_mobile,
            },
          });
        }
      }

      // Remove any duplicate email/mobile contacts (non-primary ones)
      const allEmailContacts = user.contacts?.filter(c => c.contact_type?.toLowerCase() === 'email') || [];
      const allMobileContacts = user.contacts?.filter(c => c.contact_type?.toLowerCase() === 'mobile') || [];
      
      // Remove non-primary email contacts
      for (const emailContact of allEmailContacts) {
        if (emailContact.id !== primaryEmailContact?.id) {
          await removeContactMutation.mutateAsync({
            userId: params.id,
            contactId: emailContact.id,
          });
        }
      }
      
      // Remove non-primary mobile contacts
      for (const mobileContact of allMobileContacts) {
        if (mobileContact.id !== primaryMobileContact?.id) {
          await removeContactMutation.mutateAsync({
            userId: params.id,
            contactId: mobileContact.id,
          });
        }
      }

      // Handle additional contacts
      const currentAdditional = getAdditionalContacts();
      const newAdditional = (data.additional_contacts || []).filter(
        c => c.contact_type_id && c.contact && c.contact.trim() !== ''
      );

      // Remove contacts that are no longer in the list
      for (const current of currentAdditional) {
        if (current.id && !newAdditional.find(n => n.id === current.id)) {
          await removeContactMutation.mutateAsync({
            userId: params.id,
            contactId: current.id,
          });
        }
      }

      // Add or update new additional contacts
      for (const newContact of newAdditional) {
        if (newContact.id) {
          // Update existing contact
          const current = currentAdditional.find(c => c.id === newContact.id);
          if (current && current.contact !== newContact.contact) {
            await updateContactMutation.mutateAsync({
              userId: params.id,
              contactId: newContact.id,
              contactData: { contact: newContact.contact },
            });
          }
        } else {
          // Add new contact
          await addContactMutation.mutateAsync({
            userId: params.id,
            contactData: {
              contact_type_id: newContact.contact_type_id,
              contact: newContact.contact,
            },
          });
        }
      }

      router.back();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  if (isLoading || loadingContactTypes) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading user..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load user. Please try again.</p>
        </div>
      </div>
    );
  }

  const displayName = user.first_name || user.last_name
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.username;

  const isPending = updateUserMutation.isPending || addContactMutation.isPending || 
                    removeContactMutation.isPending || updateContactMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit User</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Update information for {displayName}
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Update the user's information and contacts</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  disabled={isPending}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  disabled={isPending}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={watch('is_active') ?? user.is_active}
                onCheckedChange={(checked) => {
                  setValue('is_active', checked as boolean);
                }}
                disabled={isPending}
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Active
              </Label>
            </div>

            {/* Primary Contacts */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="primary_email">Primary Email *</Label>
                <Input
                  id="primary_email"
                  type="email"
                  {...register('primary_email')}
                  disabled={isPending}
                  placeholder="user@example.com"
                />
                {errors.primary_email && (
                  <p className="text-sm text-destructive">{errors.primary_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_mobile">Primary Mobile Number *</Label>
                <Input
                  id="primary_mobile"
                  type="tel"
                  {...register('primary_mobile')}
                  disabled={isPending}
                  placeholder="+1234567890"
                />
                {errors.primary_mobile && (
                  <p className="text-sm text-destructive">{errors.primary_mobile.message}</p>
                )}
              </div>
            </div>

            {/* Additional Contacts (Optional) */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Additional Contacts (Optional)</Label>
              {fields.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add additional contact methods if needed
                </p>
              )}
              {fields.map((field: { id: string }, index: number) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <Controller
                      name={`additional_contacts.${index}.contact_type_id`}
                      control={control}
                      render={({ field: controllerField }: { field: { value: string; onChange: (value: string) => void } }) => (
                        <Select
                          value={controllerField.value}
                          onValueChange={controllerField.onChange}
                          disabled={isPending || loadingContactTypes}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact type" />
                          </SelectTrigger>
                          <SelectContent>
                            {contactTypes &&
                              contactTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.contact_type}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.additional_contacts?.[index]?.contact_type_id && (
                      <p className="text-sm text-destructive">
                        {errors.additional_contacts[index]?.contact_type_id?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      {...register(`additional_contacts.${index}.contact`)}
                      disabled={isPending}
                      placeholder="email@example.com or +1234567890"
                    />
                    {errors.additional_contacts?.[index]?.contact && (
                      <p className="text-sm text-destructive">
                        {errors.additional_contacts[index]?.contact?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.additional_contacts && typeof errors.additional_contacts.message === 'string' && (
                <p className="text-sm text-destructive">
                  {errors.additional_contacts.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ contact_type_id: '', contact: '' })}
                disabled={isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isPending} 
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
