import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Flag,
  Hash,
  History,
  MessageSquare,
  Send,
  Tag,
  Trash2,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PriorityDot } from "@/components/shared/priority";
import { api, patch, post, del } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { PRIORITIES, PRIORITY_META, TASK_TYPES, TYPE_META, type Priority, type TaskType } from "@/lib/constants";
import type { Activity, Column, Comment, Task } from "@/lib/types";
import { cn, formatDate, timeAgo, toInputDate } from "@/lib/utils";
import { toast } from "sonner";

interface TaskSheetProps {
  taskId: string;
  columns: Column[];
  members: { id: string; role: string; user: { id: string; name: string; avatarUrl: string | null } }[];
  onOpenChange: (open: boolean) => void;
}

function Field({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      {children}
    </div>
  );
}

export function TaskSheet({ taskId, columns, members, onOpenChange }: TaskSheetProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => api<{ task: Task }>(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  });

  const { data: commentsData } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => api<{ comments: Comment[] }>(`/api/tasks/${taskId}/comments`),
    enabled: !!taskId,
  });

  const { data: activityData } = useQuery({
    queryKey: ["activity", taskId],
    queryFn: () => api<{ activities: Activity[] }>(`/api/tasks/${taskId}/activity`),
    enabled: !!taskId,
  });

  const task = data?.task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      try {
        setLabels(JSON.parse(task.labels));
      } catch {
        setLabels([]);
      }
    }
  }, [task?.id, task?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    queryClient.invalidateQueries({ queryKey: ["board", task?.projectId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["activity", taskId] });
  };

  const updateTask = useMutation({
    mutationFn: (fields: {
      title?: string;
      description?: string | null;
      priority?: Priority;
      assigneeId?: string | null;
      dueDate?: string | null;
      storyPoints?: number | null;
      labels?: string[];
      columnId?: string | null;
      type?: TaskType;
    }) => patch(`/api/tasks/${taskId}`, fields),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const addComment = useMutation({
    mutationFn: (body: string) => post(`/api/tasks/${taskId}/comments`, { body }),
    onSuccess: () => {
      setCommentDraft("");
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not comment"),
  });

  const deleteComment = useMutation({
    mutationFn: (id: string) => del(`/api/tasks/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", taskId] }),
  });

  const deleteTask = useMutation({
    mutationFn: () => del(`/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", task?.projectId] });
      onOpenChange(false);
      toast.success("Task deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  function commitLabels() {
    const trimmed = labels.filter(Boolean);
    if (JSON.stringify(trimmed) !== task?.labels) updateTask.mutate({ labels: trimmed });
  }

  function addLabel() {
    const value = labelInput.trim();
    if (value && !labels.includes(value)) {
      setLabels((prev) => [...prev, value]);
    }
    setLabelInput("");
  }

  const statusValue = task?.columnId ?? "none";

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]">
        {isPending || !task ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <TypeIcon type={task.type} />
                <span className="font-mono font-medium">{task.projectKey ?? ""}-{shortId(task.id)}</span>
                <span className="text-border">/</span>
                <span>{TYPE_META[task.type].label}</span>
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => onOpenChange(false)}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Title */}
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => title.trim() && title !== task.title && updateTask.mutate({ title: title.trim() })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).blur();
                  }
                }}
                rows={title.length > 80 ? 2 : 1}
                className="w-full resize-none bg-transparent text-lg font-semibold leading-snug tracking-tight focus:outline-none"
              />

              {/* Description */}
              <div className="mt-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => description !== (task.description ?? "") && updateTask.mutate({ description })}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-[13px] leading-relaxed placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                />
              </div>

              {/* Fields */}
              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                <Field icon={Tag} label="Status">
                  <Select
                    value={statusValue}
                    onValueChange={(v) => {
                      const column = columns.find((c) => c.id === v);
                      updateTask.mutate({ columnId: v === "none" ? null : v });
                      toast.success(column ? `Moved to ${column.name}` : "Moved out of board");
                    }}
                  >
                    <SelectTrigger className="h-8 w-full text-[13px]">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-[13px]">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field icon={User} label="Assignee">
                  <Select
                    value={task.assigneeId ?? "none"}
                    onValueChange={(v) => updateTask.mutate({ assigneeId: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="h-8 w-full text-[13px]">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-[13px] text-muted-foreground">
                        Unassigned
                      </SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id} className="text-[13px]">
                          {m.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field icon={Flag} label="Priority">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8 w-full justify-start text-[13px]">
                        <PriorityDot priority={task.priority} />
                        {PRIORITY_META[task.priority].label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      {PRIORITIES.map((p) => (
                        <DropdownMenuItem
                          key={p}
                          className="gap-2 text-[13px]"
                          onSelect={() => updateTask.mutate({ priority: p as Priority })}
                        >
                          <PriorityDot priority={p} />
                          {PRIORITY_META[p].label}
                          {task.priority === p && <span className="ml-auto text-primary">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>

                <Field icon={Hash} label="Type">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8 w-full justify-start text-[13px]">
                        <TypeIcon type={task.type} />
                        {TYPE_META[task.type].label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      {TASK_TYPES.map((t) => (
                        <DropdownMenuItem
                          key={t}
                          className="gap-2 text-[13px]"
                          onSelect={() => updateTask.mutate({ type: t as TaskType })}
                        >
                          <TypeIcon type={t} />
                          {TYPE_META[t].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>

                <Field icon={CalendarDays} label="Due date">
                  <input
                    type="date"
                    value={toInputDate(task.dueDate)}
                    onChange={(e) => updateTask.mutate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground focus:border-primary/40 focus:outline-none"
                  />
                </Field>

                <Field icon={Hash} label="Story points">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={task.storyPoints ?? ""}
                    placeholder="None"
                    onChange={(e) => updateTask.mutate({ storyPoints: e.target.value === "" ? null : Number(e.target.value) })}
                    className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[13px] focus:border-primary/40 focus:outline-none"
                  />
                </Field>
              </div>

              {/* Labels */}
              <div className="mt-4">
                <Field icon={Tag} label="Labels">
                  <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5">
                    {labels.map((l) => (
                      <span key={l} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {l}
                        <button
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const next = labels.filter((x) => x !== l);
                            setLabels(next);
                            updateTask.mutate({ labels: next });
                          }}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={labelInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.includes(",")) {
                          const parts = v.split(",");
                          const clean = parts[parts.length - 1].trim();
                          setLabels((prev) => (parts[0].trim() && !prev.includes(parts[0].trim()) ? [...prev, parts[0].trim()] : prev));
                          setLabelInput(clean);
                          return;
                        }
                        setLabelInput(v);
                      }}
                      onBlur={() => {
                        addLabel();
                        commitLabels();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addLabel();
                          commitLabels();
                        }
                      }}
                      placeholder="Add label"
                      className="min-w-24 flex-1 bg-transparent text-[12px] placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </Field>
              </div>

              {/* Meta */}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
                {task.reporter && (
                  <span className="inline-flex items-center gap-1.5">
                    Reported by <UserAvatar name={task.reporter.name} src={task.reporter.avatarUrl} className="size-4 text-[8px]" />
                    {task.reporter.name}
                  </span>
                )}
                <span>Created {formatDate(task.createdAt)}</span>
                <span>Updated {timeAgo(task.updatedAt)}</span>
              </div>

              {/* Comments */}
              <div className="mt-6">
                <h4 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold">
                  <MessageSquare className="size-3.5 text-muted-foreground" />
                  Comments
                  <span className="text-muted-foreground">({commentsData?.comments.length ?? 0})</span>
                </h4>

                <div className="space-y-4">
                  {commentsData?.comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <UserAvatar name={c.author.name} src={c.author.avatarUrl} seed={c.author.name} className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-semibold">{c.author.name}</span>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                          {(user?.id === c.author.id) && (
                            <button
                              className="ml-auto text-muted-foreground hover:text-destructive"
                              onClick={() => deleteComment.mutate(c.id)}
                              aria-label="Delete comment"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2.5">
                  <UserAvatar name={user?.name ?? "You"} src={user?.avatarUrl} seed={user?.name ?? "you"} className="mt-1" />
                  <div className="flex-1">
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (commentDraft.trim()) addComment.mutate(commentDraft.trim());
                        }
                      }}
                      rows={2}
                      placeholder="Write a comment... (Enter to send)"
                      className="w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                    />
                    <div className="mt-1.5 flex justify-end">
                      <Button
                        size="sm"
                        className="h-7 gap-1.5 text-[12px]"
                        disabled={!commentDraft.trim() || addComment.isPending}
                        onClick={() => addComment.mutate(commentDraft.trim())}
                      >
                        <Send className="size-3" /> Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-[11px] text-muted-foreground">
                {task.completedAt ? "Completed" : "Open"} · {task.projectKey ?? ""}-{shortId(task.id)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-[12px] text-destructive hover:text-destructive"
                onClick={() => deleteTask.mutate()}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="size-3.5" /> Delete task
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TypeIcon({ type }: { type: TaskType }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return <Icon className={cn("size-3.5", meta.color)} />;
}

function shortId(id: string): string {
  return id.slice(-4).toUpperCase();
}
