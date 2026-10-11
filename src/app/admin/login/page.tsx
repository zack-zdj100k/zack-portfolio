import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/server/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-4xl font-black uppercase tracking-tight display-gradient">ZACK</p>
        <h1 className="mb-8 text-lg text-mist/70">Admin. Enter your access code.</h1>
        <LoginForm />
      </div>
    </main>
  );
}
