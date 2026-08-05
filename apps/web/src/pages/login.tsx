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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <BackgroundGlow />
      <div className="fade-up relative z-10 w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-[12px] font-bold text-primary-foreground">PF</span>
          <span className="text-lg font-semibold tracking-tight">ProjectFlow</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card/80 p-7 shadow-xl backdrop-blur">
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Sign in to your workspace.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[13px] font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-[14px] outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[13px] font-medium">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-[14px] outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[14px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <>Continue <ArrowRight className="size-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          No account yet?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
        </p>
        <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
          Demo: <span className="font-mono">demo@projectflow.dev</span> / <span className="font-mono">demo1234</span>
        </p>
      </div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute left-1/2 top-[-20%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
    </div>
  );
}