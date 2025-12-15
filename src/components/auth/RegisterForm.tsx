"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegisterFormData, registerSchema } from "@/lib/validation/auth";
import { toast } from "sonner";
import Spinner from "../ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import { AtSignIcon, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { AuthFormParams } from "@/lib/auth/types";

function getPasswordStrength(password: string): {
  strength: number;
  label: string;
  color: string;
} {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
  if (strength <= 4)
    return { strength, label: "Medium", color: "bg-yellow-500" };
  return { strength, label: "Strong", color: "bg-green-500" };
}

export function RegisterForm({
  showPassword,
  setShowPassword,
  setIsSubmitting,
}: AuthFormParams) {
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (response.error) {
        toast.error(response.error.message || "Registration failed");
      } else {
        toast.success("User Registered successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    placeholder="your.email@example.com"
                    type="email"
                    {...field}
                  />
                  <InputGroupAddon>
                    <InputGroupText>
                      <AtSignIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <InputGroupAddon>
                    <InputGroupText>
                      <LockKeyhole />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.strength / 6) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <InputGroupAddon>
                    <InputGroupText>
                      <LockKeyhole />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner text="Creating account..." />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
