import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  ChevronRight,
  Inbox,
  Plus,
  Search,
  X,
  ArrowUpRight,
  CheckSquare,
  CalendarDays,
} from "lucide-react";
import { api, post, sprintApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useSocket } from "@/hooks/use-socket";
import type { BoardData, Task } from "@/lib/types";
import { PRIORITIES, PRIORITY_META, TASK_TYPES, TYPE_META, type Priority, type TaskType } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PriorityDot } from "@/components/shared/priority";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskSheet } from "@/components/board/task-sheet";
import { cn, formatDate, toInputDate, isOverdue } from "@/lib/utils";
import { toast } from "sonner";

type FilterState = {
  search: string;
  type: TaskType | "ALL";
  priority: Priority | "ALL";
  assignee: string | "ALL";
};

export function BacklogPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const { currentOrgId } = useAuthStore();
  const [filters, setFilters] = useState<FilterState>({ search: "", type: "ALL", priority: "ALL", assignee: "ALL" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", currentOrgId] });
  };

  useSocket(
    projectId,
    (evt) => {
      if (evt === "task:created" || evt === "task:updated" || evt === "task:deleted" || evt === "board:reordered" || evt.startsWith("sprint:")) {
        invalidate();
      }
    },
    () => invalidate()
  );

  const { data: boardData } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => api<BoardData>(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  const { data: sprintData } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintApi.list(projectId),
    enabled: !!projectId,
  });

  const sprints = useMemo(() => (sprintData?.sprints ?? []).filter((s) => s.status !== "CANCELLED"), [sprintData]);

  const allTasks = useMemo(
    () => (boardData?.project.columns ?? []).flatMap((c) => c.tasks).map((t) => ({ ...t, projectKey: boardData?.project.key ?? "TASK" })),
    [boardData]
  );

  const backlog = useMemo(() => allTasks.filter((t) => !t.sprintId), [allTasks]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return backlog
      .filter((t) => (filters.type === "ALL" ? true : t.type === filters.type))
      .filter((t) => (filters.priority === "ALL" ? true : t.priority === filters.priority))
      .filter((t) => (filters.assignee === "ALL" ? true : t.assigneeId === filters.assignee))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.createdAt.localeCompare(b.createdAt));
  }, [backlog, filters]);

  const createTask = useMutation({
    mutationFn: (title: string) => post(`/api/projects/${projectId}/tasks`, { title, type: "TASK" }),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create task"),
  });

  const assignToSprint = useMutation({
    mutationFn: ({ sprintId, taskIds }: { sprintId: string; taskIds: string[] }) =>
      sprintApi.addTasks(projectId, sprintId, taskIds),
    onSuccess: () => {
      setSelected(new Set());
      invalidate();
      toast.success("Tasks added to sprint");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not assign tasks"),
  });

  const submitDraft = () => {
    const title = draft.trim();
    if (!title) return;
    createTask.mutate(title, {
      onSuccess: () => setDraft(""),
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const ids = filtered.map((t) => t.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const canEdit = boardData?.myRole !== "MEMBER";
  const hasActiveFilters = filters.search !== "" || filters.type !== "ALL" || filters.priority !== "ALL" || filters.assignee !== "ALL";
  const totalPoints = backlog.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <Link to="/app/projects" className="hover:text-foreground">Projects</Link>
          <ChevronRight className="size-3" />
          <Link to={`/app/projects/${projectId}`} className="hover:text-foreground">{boardData?.project.name ?? "Project"}</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">Backlog</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Backlog</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {backlog.length} unscheduled task{backlog.length === 1 ? "" : "s"} · {totalPoints} story point{totalPoints === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 text-[12px] font-medium">
            <Link to={`/app/projects/${projectId}`} className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
              Board
            </Link>
            <span className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground shadow-sm">Backlog</span>
            <Link
              to={`/app/projects/${projectId}/sprints`}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Sprints
            </Link>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search backlog..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-8 pr-3 text-[13px] placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
        </div>

        <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v as FilterState["type"] }))}>
          <SelectTrigger className="h-9 w-32 text-[12px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-[12px]">All types</SelectItem>
            {TASK_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-[12px]">{TYPE_META[t].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(v) => setFilters((f) => ({ ...f, priority: v as FilterState["priority"] }))}>
          <SelectTrigger className="h-9 w-32 text-[12px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-[12px]">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p} className="text-[12px]">{PRIORITY_META[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.assignee} onValueChange={(v) => setFilters((f) => ({ ...f, assignee: v as string }))}>
          <SelectTrigger className="h-9 w-36 text-[12px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-[12px]">Everyone</SelectItem>
            {(boardData?.members ?? []).map((m) => (
              <SelectItem key={m.user.id} value={m.user.id} className="text-[12px]">{m.user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ search: "", type: "ALL", priority: "ALL", assignee: "ALL" })}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && canEdit && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
            <CheckSquare className="size-3.5 text-primary" /> {selected.size} selected
          </span>
          <div className="mx-1 h-4 w-px bg-border" />
          <Select
            value=""
            onValueChange={(v) => v && assignToSprint.mutate({ sprintId: v, taskIds: [...selected] })}
          >
            <SelectTrigger className="h-8 w-44 text-[12px]">
              <SelectValue placeholder="Assign to sprint..." />
            </SelectTrigger>
            <SelectContent>
              {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-rose-500"
          >
            <X className="size-3.5" /> Clear selection
          </button>
        </div>
      )}

      {/* List card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Column header */}
        <div className="hidden items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:flex">
          <button
            onClick={toggleAll}
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
              filtered.length > 0 && filtered.every((t) => selected.has(t.id))
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40"
            )}
            title={filtered.length > 0 && filtered.every((t) => selected.has(t.id)) ? "Deselect all" : "Select all"}
          >
            {filtered.length > 0 && filtered.every((t) => selected.has(t.id)) && <CheckSquare className="size-3" />}
          </button>
          <span className="flex-1">Task</span>
          <span className="w-28">Sprint</span>
          <span className="w-16 text-right">Points</span>
          <span className="w-24 text-right">Due</span>
          <span className="w-24 text-right">Assignee</span>
        </div>

        {!boardData ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14">
            <EmptyState
              icon={Inbox}
              title={hasActiveFilters ? "No matching tasks" : "Backlog is empty"}
              description={
                hasActiveFilters
                  ? "Try adjusting the filters to find what you're looking for."
                  : "Tasks that aren't assigned to a sprint live here until you schedule them."
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((t) => (
              <BacklogRow
                key={t.id}
                task={t}
                sprints={sprints}
                canEdit={canEdit}
                selected={selected.has(t.id)}
                onToggle={() => toggleSelect(t.id)}
                onOpen={() => setSelectedTaskId(t.id)}
                onAssign={(sprintId) => assignToSprint.mutate({ sprintId, taskIds: [t.id] })}
              />
            ))}
          </ul>
        )}

        {/* Quick add */}
        {canEdit && (
          <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2.5">
            <Plus className="size-4 text-muted-foreground" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitDraft();
                if (e.key === "Escape") setDraft("");
              }}
              placeholder="Add a task to the backlog, press Enter to save"
              className="flex-1 bg-transparent text-[13px] placeholder:text-muted-foreground focus:outline-none"
            />
            {draft.trim() && (
              <button
                onClick={submitDraft}
                disabled={createTask.isPending}
                className="rounded-md bg-primary px-2.5 py-1 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
              >
                Add
              </button>
            )}
          </div>
        )}
      </div>

      {selectedTaskId && boardData && (
        <TaskSheet
          taskId={selectedTaskId}
          columns={boardData.project.columns}
          members={boardData.members}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

function BacklogRow({
  task,
  sprints,
  canEdit,
  selected,
  onToggle,
  onOpen,
  onAssign,
}: {
  task: Task;
  sprints: { id: string; name: string }[];
  canEdit: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onAssign: (sprintId: string) => void;
}) {
  const TypeIcon = TYPE_META[task.type]?.icon;
  let labels: string[] = [];
  try {
    labels = JSON.parse(task.labels);
  } catch {
    labels = [];
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 transition-colors",
        selected ? "bg-primary/5" : "hover:bg-accent/40"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"
        )}
        title={selected ? "Deselect" : "Select"}
      >
        {selected && <CheckSquare className="size-3" />}
      </button>

      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
        {TypeIcon && <TypeIcon className={cn("size-4 shrink-0", TYPE_META[task.type].color)} />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-foreground">{task.title}</span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">{task.projectKey ?? "TASK"}</span>
            {labels.length > 0 && (
              <span className="flex gap-1">
                {labels.slice(0, 2).map((l) => (
                  <span key={l} className="rounded bg-muted px-1.5 py-px text-[9px] font-medium text-muted-foreground">{l}</span>
                ))}
              </span>
            )}
            <PriorityDot priority={task.priority} />
          </span>
        </span>
      </button>

      <div className="hidden w-28 shrink-0 md:block">
        {canEdit ? (
          <Select value={task.sprintId ?? ""} onValueChange={(v) => v && onAssign(v)}>
            <SelectTrigger className="h-7 w-full text-[11px]">
              <SelectValue placeholder="No sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-[11px]">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        )}
      </div>

      <span className="hidden w-16 shrink-0 text-right font-mono text-[11px] text-muted-foreground md:block">
        {task.storyPoints ?? ""}
      </span>

      <span className="hidden w-24 shrink-0 text-right md:block">
        {task.dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]",
              isOverdue(task.dueDate) ? "bg-rose-500/10 text-rose-500" : "bg-muted text-muted-foreground"
            )}
            title={formatDate(task.dueDate)}
          >
            <CalendarDays className="size-3" />
            {toInputDate(task.dueDate).slice(5)}
          </span>
        )}
      </span>

      <span className="flex w-24 shrink-0 items-center justify-end gap-1.5 md:block">
        {task.assignee ? (
          <UserAvatar name={task.assignee.name} src={task.assignee.avatarUrl} seed={task.assignee.name} />
        ) : (
          <span className="inline-block size-5 rounded-full bg-muted" />
        )}
        <button
          onClick={onOpen}
          className="ml-auto hidden text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:block"
          title="Open task"
        >
          <ArrowUpRight className="size-3.5" />
        </button>
      </span>
    </li>
  );
}
