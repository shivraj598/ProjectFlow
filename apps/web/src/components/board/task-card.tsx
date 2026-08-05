import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PriorityDot } from "@/components/shared/priority";
import { TYPE_META, PRIORITY_META } from "@/lib/constants";
import type { Task } from "@/lib/types";
import { cn, isOverdue, toInputDate, formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  columnId: string;
  onOpen: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, columnId, onOpen, isDragging }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging: sortableDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", containerId: columnId },
  });

  const active = isDragging ?? sortableDragging;
  let labels: string[] = [];
  try {
    labels = JSON.parse(task.labels);
  } catch {
    labels = [];
  }
  const TypeIcon = TYPE_META[task.type]?.icon;

  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        if (!sortableDragging) onOpen(task.id);
      }}
      className={cn(
        "group w-full cursor-grab select-none rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
        active && "z-30 opacity-95 ring-2 ring-primary/40 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {TypeIcon && <TypeIcon className={cn("size-3.5", TYPE_META[task.type].color)} />}
          <span className="font-mono font-medium">{task.projectKey ?? "TASK"}</span>
        </div>
        <PriorityDot priority={task.priority} />
      </div>

      <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
        {task.title}
      </p>

      {labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {labels.slice(0, 3).map((l) => (
            <span key={l} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5",
                isOverdue(task.dueDate)
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-muted text-muted-foreground"
              )}
              title={formatDate(task.dueDate)}
            >
              <CalendarDays className="size-3" />
              {toInputDate(task.dueDate).slice(5)}
            </span>
          )}
          {task._count?.comments ? (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3" />
              {task._count.comments}
            </span>
          ) : null}
          {task.storyPoints ? <span className="font-mono">{task.storyPoints}</span> : null}
        </span>
        <span className="ml-auto flex items-center gap-1">
          {task.assignee && <UserAvatar name={task.assignee.name} src={task.assignee.avatarUrl} seed={task.assignee.name} />}
        </span>
      </div>
    </button>
  );
}