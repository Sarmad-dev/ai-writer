import { AuthPage } from "@/components/auth/auth-page";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.session.token) {
    redirect("/dashboard");
  }

  return <AuthPage flow="signup" />;
}
