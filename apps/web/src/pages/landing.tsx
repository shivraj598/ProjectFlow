import { Link } from "react-router";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Columns3,
  Gauge,
  KanbanSquare,
  ListChecks,
  MessageSquare,
  MousePointerClick,
  Sparkles,
  Users,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">PF</span>
          <span className="text-[15px] font-semibold tracking-tight">ProjectFlow</span>
        </div>
        <div className="flex items-center gap-1">
          <a href="#features" className="hidden rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground sm:block">Features</a>
          <Link to="/login" className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link to="/register" className="ml-2 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">Get started</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[-30%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/12 blur-[140px]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-20 md:grid-cols-2 md:pt-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="size-3" /> Built for product teams
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight md:text-[52px]">
            Plan projects, run sprints, ship together.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            A fast, realtime kanban workspace that keeps your whole team in sync, from the first backlog item to launch day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className="group flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">
              Start free <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="rounded-lg border border-border px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-accent">
              See it in action
            </a>
          </div>
          <div className="mt-9 flex items-center gap-6">
            {FEATURE_TICKS.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        <BoardPreview />
      </div>
    </section>
  );
}

const FEATURE_TICKS = ["Realtime sync", "No setup", "Free to start"];

function BoardPreview() {
  const cols = [
    { name: "Backlog", tasks: ["Review onboarding copy", "Finalize sprint scope"], color: "bg-zinc-500/40" },
    { name: "In Progress", tasks: ["Dark mode flicker fix", "Mobile notifications"], color: "bg-[#5b8cff]" },
    { name: "Done", tasks: ["Setup analytics events"], color: "bg-emerald-500" },
  ];
  return (
    <div className="relative">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/30">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex size-6 items-center justify-center rounded-md bg-[#22c55e] font-mono text-[9px] font-bold text-white">WEB</span>
          <span className="text-[13px] font-semibold">Website Redesign</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        </div>
        <div className="flex gap-2.5">
          {cols.map((col) => (
            <div key={col.name} className="w-1/3 rounded-lg bg-muted/50 p-2">
              <div className="mb-2 flex items-center gap-1.5 px-0.5">
                <span className={`size-1.5 rounded-full ${col.color}`} />
                <span className="text-[10px] font-semibold text-muted-foreground">{col.name}</span>
              </div>
              <div className="space-y-1.5">
                {col.tasks.map((t) => (
                  <div key={t} className="rounded-md border border-border bg-card px-2 py-1.5">
                    <p className="text-[10px] font-medium leading-tight">{t}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-1 py-0.5 text-[8px] font-medium text-muted-foreground">high</span>
                      <span className="flex size-3.5 items-center justify-center rounded-full bg-[#5b8cff] text-[7px] font-bold text-white">AC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-2xl bg-primary/20 blur-3xl" aria-hidden />
    </div>
  );
}

function Features() {
  const big = [
    {
      icon: KanbanSquare,
      title: "Drag-and-drop boards",
      desc: "Move work between custom workflow stages. Columns, WIP clarity and inline task creation keep the flow moving.",
      tint: "text-[#5b8cff] bg-[#5b8cff]/10",
    },
    {
      icon: Gauge,
      title: "Analytics without the setup",
      desc: "Status, priority, trend and workload charts update the moment work moves.",
      tint: "text-emerald-500 bg-emerald-500/10",
    },
  ];
  const small = [
    { icon: ListChecks, title: "Task detail pane", desc: "Priority, assignee, due dates, labels and comments in one focused panel." },
    { icon: MessageSquare, title: "Comments and mentions", desc: "Discuss right inside a task, with activity history you can trace." },
    { icon: Bell, title: "Realtime updates", desc: "Boards and notifications sync across the team, no refresh needed." },
    { icon: Users, title: "Teams and roles", desc: "Organize members into workspaces with sensible permissions." },
  ];

  return (
    <section id="features" className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Everything a shipping team needs</h2>
          <p className="mt-3 text-[15px] text-muted-foreground">
            A focused set of tools that mirror how product work actually happens, without the feature bloat.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {big.map((f) => (
            <div key={f.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7">
              <span className={`inline-flex size-10 items-center justify-center rounded-lg ${f.tint}`}>
                <f.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold">{f.title}</h3>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {small.map((f) => (
            <div key={f.title} className="flex flex-col gap-2.5 bg-card p-6">
              <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                <f.icon className="size-3.5 text-muted-foreground" />
              </div>
              <h4 className="text-[13px] font-semibold">{f.title}</h4>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
        </div>
        <FileIcon className="mx-auto mb-5" />
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight">
          Push your next project out the door.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-muted-foreground">
          Create a free workspace and get your first board running in under a minute. No credit card required.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">
            Start free
          </Link>
          <Link to="/login" className="rounded-lg border border-border px-5 py-2.5 text-[14px] font-medium hover:bg-accent">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <span className={`flex size-12 items-center justify-center rounded-2xl bg-primary/15 ${className}`}>
      <Columns3 className="size-6 text-primary" />
    </span>
  );
}