import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Users,
  Target,
  ListTodo,
  Flag,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, sprintApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useSocket } from "@/hooks/use-socket";
import type { BoardData } from "@/lib/types";
import { SPRINT_STATUS_META } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";

export function SprintDetailPage({ projectId, sprintId }: { projectId: string; sprintId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentOrgId } = useAuthStore();
  const [showAddTasks, setShowAddTasks] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    queryClient.invalidateQueries({ queryKey: ["sprint", projectId, sprintId] });
    queryClient.invalidateQueries({ queryKey: ["burndown", projectId, sprintId] });
    queryClient.invalidateQueries({ queryKey: ["board", projectId] });
  };

  useSocket(
    projectId,
    (evt) => {
      if (evt.startsWith("sprint:") || evt === "task:updated" || evt === "task:deleted" || evt === "board:reordered") {
        invalidate();
      }
    },
    (evt) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", currentOrgId] });
      void evt;
    }
  );

  const { data: sprintData, isPending } = useQuery({
    queryKey: ["sprint", projectId, sprintId],
    queryFn: () => sprintApi.list(projectId).then((r) => r.sprints.find((s) => s.id === sprintId)),
    enabled: !!projectId && !!sprintId,
  });

  const { data: boardData } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => api<BoardData>(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  const { data: burndownData } = useQuery({
    queryKey: ["burndown", projectId, sprintId],
    queryFn: () => sprintApi.getBurndown(projectId, sprintId),
    enabled: !!projectId && !!sprintId && sprintData?.status === "ACTIVE",
  });

  const startSprint = useMutation({
    mutationFn: () => sprintApi.update(projectId, sprintId, { status: "ACTIVE" }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start sprint"),
  });

  const completeSprint = useMutation({
    mutationFn: () => sprintApi.update(projectId, sprintId, { status: "COMPLETED" }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not complete sprint"),
  });

  const cancelSprint = useMutation({
    mutationFn: () => sprintApi.update(projectId, sprintId, { status: "CANCELLED" }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel sprint"),
  });

  const deleteSprint = useMutation({
    mutationFn: () => sprintApi.delete(projectId, sprintId),
    onSuccess: () => navigate(`/app/projects/${projectId}/sprints`),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete sprint"),
  });

  const addTasks = useMutation({
    mutationFn: (taskIds: string[]) => sprintApi.addTasks(projectId, sprintId, taskIds),
    onSuccess: () => {
      setShowAddTasks(false);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add tasks"),
  });

  const removeTask = useMutation({
    mutationFn: (taskId: string) => sprintApi.removeTask(projectId, sprintId, taskId),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not remove task"),
  });

  const addMember = useMutation({
    mutationFn: (userId: string) => sprintApi.addMembers(projectId, sprintId, [userId]),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add member"),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => sprintApi.removeMember(projectId, sprintId, userId),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not remove member"),
  });

  if (isPending || !sprintData) {
    return (
      <div className="flex h-[calc(100dvh-8rem)] items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const sprint = sprintData;
  const status = SPRINT_STATUS_META[sprint.status];
  const canManage = boardData?.myRole !== "MEMBER";
  const progress = sprint.totalStoryPoints > 0 ? Math.round((sprint.completedStoryPoints / sprint.totalStoryPoints) * 100) : 0;

  // Tasks in the sprint (from board data)
  const sprintTaskIds = new Set((sprint.tasks ?? []).map((t) => t.id));
  const allTasks = (boardData?.project.columns ?? []).flatMap((c) => c.tasks);
  const sprintTasks = allTasks.filter((t) => sprintTaskIds.has(t.id));
  const backlogTasks = allTasks.filter((t) => !t.sprintId);
  const memberIds = new Set(sprint.members.map((m) => m.user.id));

  const toggleMember = (userId: string) => {
    if (memberIds.has(userId)) removeMember.mutate(userId);
    else addMember.mutate(userId);
  };

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <Link to="/app/projects" className="hover:text-foreground">Projects</Link>
          <ChevronRight className="size-3" />
          <Link to={`/app/projects/${projectId}`} className="hover:text-foreground">{boardData?.project.name ?? "Project"}</Link>
          <ChevronRight className="size-3" />
          <Link to={`/app/projects/${projectId}/sprints`} className="hover:text-foreground">Sprints</Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{sprint.name}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight">{sprint.name}</h1>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium", status.color)}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                {status.label}
              </span>
            </div>
            {sprint.goal && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Target className="size-3.5" /> {sprint.goal}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted-foreground">
              {(sprint.startDate || sprint.endDate) && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {sprint.startDate ? formatDate(sprint.startDate) : "No start"} — {sprint.endDate ? formatDate(sprint.endDate) : "No end"}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {sprint.members.length} members
              </span>
              <span className="flex items-center gap-1">
                <ListTodo className="size-3.5" /> {sprintTasks.length} tasks
              </span>
            </div>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              {(sprint.status === "PLANNED" || sprint.status === "COMPLETED" || sprint.status === "CANCELLED") && (
                <button
                  onClick={() => startSprint.mutate()}
                  disabled={startSprint.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {sprint.status === "PLANNED" ? <Play className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                  {sprint.status === "PLANNED" ? "Start sprint" : "Reactivate"}
                </button>
              )}
              {sprint.status === "ACTIVE" && (
                <button
                  onClick={() => completeSprint.mutate()}
                  disabled={completeSprint.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[12px] font-medium text-white shadow-sm transition-all hover:bg-emerald-600/90 disabled:opacity-50"
                >
                  <CheckCircle2 className="size-3.5" /> Complete
                </button>
              )}
              {sprint.status === "PLANNED" && (
                <button
                  onClick={() => cancelSprint.mutate()}
                  disabled={cancelSprint.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <XCircle className="size-3.5" /> Cancel
                </button>
              )}
              {sprint.status !== "ACTIVE" && (
                <button
                  onClick={() => {
                    if (confirm("Delete this sprint? Its tasks will return to the backlog.")) deleteSprint.mutate();
                  }}
                  disabled={deleteSprint.isPending}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium text-rose-500 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total tasks" value={sprint._count.tasks} icon={ListTodo} tint="text-sky-500 bg-sky-500/10" />
        <StatCard label="Story points" value={sprint.totalStoryPoints} icon={Sparkles} tint="text-violet-500 bg-violet-500/10" />
        <StatCard label="Completed" value={`${sprint.completedStoryPoints} pts`} icon={CheckCircle2} tint="text-emerald-500 bg-emerald-500/10" sub={`${progress}% done`} />
        <StatCard label="Members" value={sprint.members.length} icon={Users} tint="text-amber-500 bg-amber-500/10" />
      </div>

      {/* Burndown + Members */}
      {sprint.status === "ACTIVE" && burndownData && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Burndown chart</h3>
              <span className="text-[11px] text-muted-foreground">{formatDate(burndownData.sprintStart)} — {formatDate(burndownData.sprintEnd)}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={burndownData.burndown} margin={{ left: -18, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
                      <p className="mb-1 font-medium text-foreground">{label}</p>
                      {payload.map((p: any) => (
                        <p key={p.name} className="flex items-center gap-2 text-muted-foreground">
                          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}: <span className="font-medium text-foreground">{p.value}</span>
                        </p>
                      ))}
                    </div>
                  );
                }} />
                <Line type="monotone" dataKey="ideal" name="Ideal" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" name="Remaining" stroke="#5b8cff" strokeWidth={2.5} dot={{ r: 3, fill: "#5b8cff", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-[13px] font-semibold">Sprint members</h3>
            {sprint.members.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-muted-foreground">No members yet</p>
            ) : (
              <ul className="space-y-2">
                {sprint.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5">
                    <UserAvatar name={m.user.name} src={m.user.avatarUrl} seed={m.user.name} />
                    <span className="min-w-0 flex-1 truncate text-[12px]">{m.user.name}</span>
                    {canManage && sprint.status !== "COMPLETED" && (
                      <button
                        onClick={() => toggleMember(m.user.id)}
                        className="text-[10px] text-muted-foreground hover:text-rose-500"
                        title="Remove member"
                      >
                        <XCircle className="size-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {canManage && (
              <div className="mt-3 border-t border-border/60 pt-3">
                <h4 className="mb-2 text-[11px] font-semibold text-muted-foreground">Add from organization</h4>
                <div className="flex flex-wrap gap-1.5">
                  {boardData?.members
                    .filter((m) => !memberIds.has(m.user.id))
                    .map((m) => (
                      <button
                        key={m.user.id}
                        onClick={() => toggleMember(m.user.id)}
                        className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        title={`Add ${m.user.name}`}
                      >
                        <UserAvatar name={m.user.name} src={m.user.avatarUrl} seed={m.user.name} className="size-4 text-[8px]" />
                        {m.user.name.split(" ")[0]}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Sprint tasks ({sprintTasks.length})</h3>
          {canManage && sprint.status !== "COMPLETED" && (
            <button
              onClick={() => setShowAddTasks((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="size-3.5" /> Add tasks from backlog
            </button>
          )}
        </div>

        {showAddTasks && (
          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
            <h4 className="mb-2 text-[11px] font-semibold text-muted-foreground">Backlog ({backlogTasks.length})</h4>
            {backlogTasks.length === 0 ? (
              <p className="py-3 text-center text-[12px] text-muted-foreground">No unassigned tasks in the backlog</p>
            ) : (
              <ul className="max-h-56 space-y-1 overflow-y-auto">
                {backlogTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
                    <button
                      onClick={() => addTasks.mutate([t.id])}
                      className="flex size-5 shrink-0 items-center justify-center rounded border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                      title="Add to sprint"
                    >
                      <Plus className="size-3" />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-[12px]">{t.title}</span>
                    {t.storyPoints ? <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{t.storyPoints} pts</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {sprintTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks in this sprint"
            description="Add tasks from the backlog to start planning the sprint."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {sprintTasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <Link
                  to={`/app/projects/${projectId}?task=${t.id}`}
                  className="min-w-0 flex-1 truncate text-[13px] hover:text-primary"
                >
                  {t.title}
                </Link>
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={cn("inline-flex items-center gap-1", TYPE_COLORS[t.type])}>
                    {t.type.toLowerCase()}
                  </span>
                  {t.storyPoints ? <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{t.storyPoints}</span> : null}
                  {t.completedAt && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                  {t.assignee && <UserAvatar name={t.assignee.name} src={t.assignee.avatarUrl} seed={t.assignee.name} className="size-5 text-[9px]" />}
                  {canManage && sprint.status !== "COMPLETED" && (
                    <button
                      onClick={() => removeTask.mutate(t.id)}
                      className="text-muted-foreground hover:text-rose-500"
                      title="Remove from sprint"
                    >
                      <XCircle className="size-3.5" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  EPIC: "text-violet-500",
  STORY: "text-sky-500",
  TASK: "text-muted-foreground",
  BUG: "text-rose-500",
  SUBTASK: "text-slate-400",
};

function StatCard({ label, value, icon: Icon, tint, sub }: { label: string; value: number | string; icon: typeof Flag; tint: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={cn("inline-flex size-8 items-center justify-center rounded-lg", tint)}>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-muted-foreground/80">{sub}</p>}
    </div>
  );
}