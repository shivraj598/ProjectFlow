import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/stores/auth-store";
import type { OrgSummary } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AuthShell, Field } from "@/components/auth-shell";
import { TEXT } from "@/components/landing/tokens";

export function RegisterPage() {
  const navigate = useNavigate();
  const { accessToken, setTokens, setUser, setCurrentOrg } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      const res = await post<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/register", { name, email, password });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      toast.success("Welcome to ProjectFlow");
      // prompt for org creation on the dashboard empty state
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  if (accessToken) return <Navigate to="/app" replace />;

  return (
    <AuthShell
      badge="sign-up"
      title="Create account"
      subtitle="Provision a new workspace identity · SYS-02"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium underline underline-offset-4" style={{ color: TEXT }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field id="name" label="Name" type="text" autoComplete="name" value={name} onChange={setName} placeholder="Your name" />
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@company.com" />
        <Field id="password" label="Password" type="password" autoComplete="new-password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
        <button
          type="submit"
          disabled={busy}
          className="flex h-10 w-full items-center justify-center gap-1.5 text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>Create account <ArrowRight className="size-4" /></>}
        </button>
      </form>
    </AuthShell>
  );
}