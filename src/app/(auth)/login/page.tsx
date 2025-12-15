import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { AuthPage } from "@/components/auth/auth-page";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.session.token) {
    redirect("/dashboard");
  }

  return <AuthPage flow="signin" />;
}
