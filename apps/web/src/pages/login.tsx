import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { api, post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/stores/auth-store";
import type { OrgSummary } from "@/lib/types";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { AuthShell, Field } from "@/components/auth-shell";
import { ACCENT, FAINT, LINE_SOFT, MUTED, ON_ACCENT, TEXT } from "@/components/landing/tokens";

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

  function fillDemo() {
    setEmail("demo@projectflow.dev");
    setPassword("demo1234");
    toast.success("Demo credentials filled — hit Continue");
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
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          icon={<Mail className="size-4" />}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={<Lock className="size-4" />}
          toggleVisibility
        />
        <button
          type="submit"
          disabled={busy}
          className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-bold transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          style={{ background: ACCENT, color: ON_ACCENT }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>}
        </button>
        <button
          type="button"
          onClick={fillDemo}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-[13px] font-medium transition-colors hover:bg-[var(--ld-accent-soft)]"
          style={{ borderColor: LINE_SOFT, color: MUTED }}
        >
          <Sparkles className="size-3.5" />
          Autofill demo account
          <span className="font-mono text-[10px]" style={{ color: FAINT }}>demo1234</span>
        </button>
      </form>
    </AuthShell>
  );
}
