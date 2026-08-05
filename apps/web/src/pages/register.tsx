import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/stores/auth-store";
import type { OrgSummary } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[-20%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="fade-up relative z-10 w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-[12px] font-bold text-primary-foreground">PF</span>
          <span className="text-lg font-semibold tracking-tight">ProjectFlow</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card/80 p-7 shadow-xl backdrop-blur">
          <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Start planning projects in minutes.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[13px] font-medium">Name</label>
              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-[14px] outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
                placeholder="Your name"
              />
            </div>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-[14px] outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[14px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <>Create account <ArrowRight className="size-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}