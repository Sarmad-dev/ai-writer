"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth/auth-client";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import { AtSignIcon, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { LoginFormData, loginSchema } from "@/lib/validation/auth";
import { AuthFormParams } from "@/lib/auth/types";
import { toast } from "sonner";
import Spinner from "../ui/spinner";

export function LoginForm({
  showPassword,
  setShowPassword,
  setIsSubmitting,
}: AuthFormParams) {
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        toast.error(response.error.message || "Invalid credentials");
      } else {
        toast.success(
          `${
            response.data.user.name || response.data.user.email
          } Signed in Successfully`
        );
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <p className="text-start text-muted-foreground text-xs">
          Enter your email address to sign in
        </p>
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
            <Spinner text="Logging in" />
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
}
