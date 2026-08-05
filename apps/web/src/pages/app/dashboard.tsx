import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Building2, FolderKanban } from "lucide-react";
import {
  Activity as ActivityIcon,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  ClipboardList,
  Timer,
  TriangleAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { DashboardData } from "@/lib/types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateOrgDialog } from "@/components/app/org-switcher";
import { PRIORITY_META } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

const STATUS_COLORS = ["#5b8cff", "#8b5cf6", "#f59e0b", "#14b8a6", "#22c55e", "#ec4899", "#64748b"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.fill }} />
          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { currentOrgId } = useAuthStore();
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);

  if (!currentOrgId) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15">
            <Building2 className="size-7 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Set up your workspace</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Create an organization to start adding workspaces, projects and teammates.
          </p>
          <button
            onClick={() => setOrgDialogOpen(true)}
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-[14px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Create organization
          </button>
          <CreateOrgDialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen} />
        </div>
      </div>
    );
  }

  const { data, isPending } = useQuery({
    queryKey: ["dashboard", currentOrgId],
    queryFn: () => api<DashboardData>(`/api/orgs/${currentOrgId}/dashboard`),
    enabled: !!currentOrgId,
  });

  if (isPending || !data) {
    return (
      <div className="grid grid-cols-4 gap-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    );
  }

  const { totals, byStatus, byPriority, byAssignee, trend, recentActivity, activeProjects } = data;

  const statusData = byStatus.map((s, i) => ({ ...s, fill: STATUS_COLORS[i % STATUS_COLORS.length] }));
  const priorityData = byPriority
    .map((p) => ({ ...p, fill: PRIORITY_META[p.priority as keyof typeof PRIORITY_META]?.dot ?? "#71717a" }))
    .sort((a, b) => b.count - a.count);

  const stats = [
    { label: "Total tasks", value: totals.tasks, icon: ClipboardList, tint: "text-sky-500 bg-sky-500/10" },
    { label: "Completed", value: totals.completed, icon: CheckCircle2, tint: "text-emerald-500 bg-emerald-500/10", sub: `${totals.completionRate}% done` },
    { label: "In progress", value: totals.inProgress, icon: Timer, tint: "text-blue-500 bg-blue-500/10" },
    { label: "Overdue", value: totals.overdue, icon: TriangleAlert, tint: "text-rose-500 bg-rose-500/10", sub: `${totals.dueSoon} due soon` },
    { label: "Projects", value: totals.projects, icon: FolderKanban, tint: "text-violet-500 bg-violet-500/10", sub: `${totals.members} members` },
  ];

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Org-wide overview of work in flight</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className={`inline-flex size-8 items-center justify-center rounded-lg ${s.tint}`}>
              <s.icon className="size-4" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</p>
            <p className="text-[12px] text-muted-foreground">{s.label}</p>
            {s.sub && <p className="mt-0.5 text-[11px] font-medium text-muted-foreground/80">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-[13px] font-semibold">Tasks by status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {statusData.map((s) => (
              <span key={s.status} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.fill }} />
                {s.status} <b className="text-foreground">{s.count}</b>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-[13px] font-semibold">Tasks by priority</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="priority" width={72} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={14}>
                {priorityData.map((p, i) => (
                  <Cell key={i} fill={p.fill} />
                ))}
              </Bar>
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-[13px] font-semibold">14 day trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ left: -22, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#5b8cff" fill="#5b8cff" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[13px] font-semibold">
              <ActivityIcon className="size-3.5 text-muted-foreground" /> Recent activity
            </h3>
            <Link to="/app/projects" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
              View projects <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <EmptyState icon={ActivityIcon} title="Nothing yet" description="Task moves, comments and changes will show up here." />
          ) : (
            <ul className="space-y-0">
              {recentActivity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0">
                  {a.actor ? (
                    <UserAvatar name={a.actor.name} src={a.actor.avatarUrl} seed={a.actor.name} />
                  ) : (
                    <span className="size-6 rounded-full bg-muted" />
                  )}
                  <p className="min-w-0 flex-1 truncate text-[13px]">
                    <span className="font-medium">{a.message}</span>
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[13px] font-semibold">Workload by assignee</h3>
            {byAssignee.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted-foreground">No assigned tasks yet</p>
            ) : (
              <ul className="space-y-2.5">
                {byAssignee.slice(0, 5).map((a) => (
                  <li key={a.user.id} className="flex items-center gap-2.5">
                    <UserAvatar name={a.user.name} src={a.user.avatarUrl} seed={a.user.name} />
                    <span className="min-w-0 flex-1 truncate text-[12px]">{a.user.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">{a.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold">
              <FolderKanban className="size-3.5 text-muted-foreground" /> Active projects
            </h3>
            {activeProjects.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted-foreground">Create a project to get started</p>
            ) : (
              <ul className="space-y-2">
                {activeProjects.map((p) => (
                  <li key={p.id}>
                    <Link to={`/app/projects/${p.id}`} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-accent/50">
                      <span className="size-2.5 rounded-[4px]" style={{ backgroundColor: p.color }} />
                      <span className="flex-1 truncate text-[13px] font-medium">{p.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{p.key}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{p.taskCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}