import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/stores/auth-store";
import type { OrgSummary } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AuthShell, Field } from "@/components/auth-shell";
import { ACCENT, FAINT, MUTED, ON_ACCENT, TEXT } from "@/components/landing/tokens";

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function passwordScore(pw: string) {
  if (pw.length === 0) return -1;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { accessToken, setTokens, setUser, setCurrentOrg } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const score = passwordScore(password);

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
        <Field
          id="name"
          label="Name"
          type="text"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={setName}
          placeholder="Your name"
          icon={<User className="size-4" />}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          icon={<Mail className="size-4" />}
        />
        <div>
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            icon={<Lock className="size-4" />}
            toggleVisibility
          />
          {score >= 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors duration-300"
                    style={{ background: i <= score ? ACCENT : "var(--ld-accent-soft)", opacity: i <= score ? 1 - i * 0.18 : 1 }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: score >= 3 ? TEXT : score >= 2 ? MUTED : FAINT }}>
                {STRENGTH_LABELS[score]}
              </span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[14px] font-bold transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          style={{ background: ACCENT, color: ON_ACCENT }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {busy ? <Loader2 className="size-4 animate-spin" /> : <>Create account <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
