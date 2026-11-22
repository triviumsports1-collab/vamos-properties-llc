import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <p className="text-sm font-medium text-muted">Vamos Properties</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Sign in to the desk</h1>
      <p className="mt-3 text-base leading-7 text-muted">
        The Vamos Properties team uses this desk to work new seller requests. It is not part of the public site.
      </p>
      <div className="mt-2 border border-line bg-panel p-6">
        <LoginForm />
      </div>
    </main>
  );
}
