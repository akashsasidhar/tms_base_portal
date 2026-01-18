"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/hooks/useUsers";
import { contactTypeService } from "@/services/contactType.service";
import { roleService } from "@/services/role.service";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ContactType } from "@/types/contact.types";
import type { Role } from "@/types/role.types";
import { formatRoleName } from "@/lib/role-utils";
import { generateUsername } from "@/utils/common.utils";

// Validation schema
// Password is optional - default password will be used and user will receive setup email
const createUserSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    confirm_password: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    contacts: z
      .array(
        z.object({
          contact_type_id: z.string().min(1, "Contact type is required"),
          contact: z.string().min(1, "Contact is required"),
        }),
      )
      .min(1, "At least one contact is required"),
    role_id: z.string().uuid("Invalid role ID").optional(),
  })
  .refine(
    data => {
      // Only validate password match if password is provided
      if (data.password && data.confirm_password) {
        return data.password === data.confirm_password;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirm_password"],
    },
  );

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();
  const { hasPermission } = usePermissions();
  const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingContactTypes, setLoadingContactTypes] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const canCreate = hasPermission("users:create");

  if (!canCreate) {
    return (
      <div className="space-y-6">
        <Link href="/users">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-destructive">You don't have permission to create users.</p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      contacts: [{ contact_type_id: "", contact: "" }],
      role_id: undefined,
      username: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const firstName = watch("first_name");
  const lastName = watch("last_name");

  useEffect(() => {
    if (!firstName && !lastName) return; // early exit if names are missing

  const generated = generateUsername(firstName, lastName);

  if (generated) {
    setValue("username", generated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }
}, [firstName, lastName, setValue]);

  // Fetch contact types on mount
  useEffect(() => {
    const fetchContactTypes = async () => {
      try {
        const types = await contactTypeService.getAll();
        setContactTypes(types.filter(t => t.is_active));
      } catch (error) {
        toast.error("Failed to load contact types");
        console.error("Error fetching contact types:", error);
      } finally {
        setLoadingContactTypes(false);
      }
    };

    fetchContactTypes();
  }, []);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getAll();
        const rolesData = response.data?.data || response.data || [];
        setRoles(Array.isArray(rolesData) ? rolesData.filter((r: Role) => r.is_active) : []);
      } catch (error) {
        toast.error("Failed to load roles");
        console.error("Error fetching roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const onSubmit = async (data: CreateUserFormData) => {
    const { confirm_password, role_id, password, ...createData } = data;
    const submitData = {
      ...createData,
      ...(password ? { password } : {}), // Only include password if provided
      ...(role_id ? { role_ids: [role_id] } : {}), // Convert single role_id to array for backend
    };
    createUser(submitData, {
      onSuccess: () => {
        toast.success(
          password
            ? "User created successfully"
            : "User created successfully. An email has been sent to the user to set up their password.",
        );
        router.push("/users");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/users">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create New User</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Add a new user to the system</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter the user's information to create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  disabled={isPending}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  disabled={isPending}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username")}
                disabled={isPending}
                placeholder="johndoe"
                readOnly
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Contacts */}
            <div className="space-y-2">
              <Label>Contacts *</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <Controller
                      name={`contacts.${index}.contact_type_id`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                    {errors.contacts?.[index]?.contact_type_id && (
                      <p className="text-sm text-destructive">
                        {errors.contacts[index]?.contact_type_id?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      {...register(`contacts.${index}.contact`)}
                      disabled={isPending}
                      placeholder="email@example.com or +1234567890"
                    />
                    {errors.contacts?.[index]?.contact && (
                      <p className="text-sm text-destructive">
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
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.contacts && typeof errors.contacts.message === "string" && (
                <p className="text-sm text-destructive">{errors.contacts.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ contact_type_id: "", contact: "" })}
                disabled={isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>

            {/* Role */}
            {!loadingRoles && roles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="role_id">Role</Label>
                <Controller
                  name="role_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger id="role_id">
                        <SelectValue placeholder="Select a role (optional)" />
                      </SelectTrigger>

                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {formatRoleName(role.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role_id && (
                  <p className="text-sm text-destructive">{errors.role_id.message}</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
            <Link href="/users" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
