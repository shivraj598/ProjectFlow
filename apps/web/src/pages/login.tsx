import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { api, post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/stores/auth-store";
import type { OrgSummary } from "@/lib/types";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { AuthShell, Field } from "@/components/auth-shell";
import { FAINT, MUTED, TEXT } from "@/components/landing/tokens";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, setTokens, setUser, setCurrentOrg } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await post<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/login", { email, password });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      const orgs = await api<{ orgs: OrgSummary[] }>("/api/orgs").catch(() => null);
      if (orgs?.orgs?.length) setCurrentOrg(orgs.orgs[0].id);
      const from = (location.state as { from?: string })?.from;
      navigate(from?.startsWith("/app") ? from : "/app/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  if (accessToken) return <Navigate to="/app/dashboard" replace />;

  return (
    <AuthShell
      badge="sign-in"
      title="Welcome back"
      subtitle="Authenticate to resume your workspace · SYS-01"
      footer={
        <>
          No account yet?{" "}
          <Link to="/register" className="font-medium underline underline-offset-4" style={{ color: TEXT }}>
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="you@company.com" />
        <Field id="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} placeholder="••••••••" />
        <button
          type="submit"
          disabled={busy}
          className="flex h-10 w-full items-center justify-center gap-1.5 text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>Continue <ArrowRight className="size-4" /></>}
        </button>
      </form>

      <p className="mt-5 flex items-center justify-between border-t pt-4 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ borderColor: "rgba(255,255,255,0.07)", color: FAINT }}>
        Demo access
        <span className="normal-case tracking-normal" style={{ color: MUTED }}>
          demo@projectflow.dev · demo1234
        </span>
      </p>
    </AuthShell>
  );
}