import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { ColumnMenu } from "./column-menu";
import type { Column } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
  projectKey: string;
  canEdit: boolean;
  onOpenTask: (taskId: string) => void;
  onAddTask: (columnId: string, title: string) => void;
  onRenameColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  isOver?: boolean;
}

export function KanbanColumn({
  column,
  projectKey,
  canEdit,
  onOpenTask,
  onAddTask,
  onRenameColumn,
  onDeleteColumn,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: "column" } });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const atWipLimit = column.wipLimit != null && column.tasks.length >= column.wipLimit;

  function submit() {
    if (title.trim()) onAddTask(column.id, title.trim());
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[290px] shrink-0 flex-col rounded-xl bg-muted/40",
        isOver && "bg-accent/40 ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className={cn("size-2 rounded-full", column.name.toLowerCase() === "done" ? "bg-emerald-500" : "bg-zinc-400/70")} />
        <span className="text-[13px] font-semibold">{column.name}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {column.tasks.length}
          {column.wipLimit ? ` / ${column.wipLimit}` : ""}
        </span>
        {atWipLimit && (
          <span className="text-[10px] font-medium text-amber-500">At limit</span>
        )}
        <div className="ml-auto">
          {canEdit && (
            <ColumnMenu
              onRename={(name) => onRenameColumn(column.id, name)}
              onDelete={() => onDeleteColumn(column.id)}
            />
          )}
        </div>
      </div>

      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={{ ...task, projectKey }} columnId={column.id} onOpen={onOpenTask} />
          ))}
          {adding && (
            <TaskQuickAdd
              value={title}
              onChange={setTitle}
              onCommit={submit}
              onCancel={() => setAdding(false)}
            />
          )}
        </div>
      </SortableContext>

      <div className="p-2">
        <button
          onClick={() => {
            setAdding(true);
          }}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-3.5" /> Add task
        </button>
      </div>
    </div>
  );
}

function TaskQuickAdd({
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <textarea
        autoFocus
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onCommit();
          }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Task title..."
        className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex items-center justify-end gap-2 border-t border-border px-2 py-1.5">
        <button onClick={onCancel} className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
          Esc
        </button>
        <button
          onClick={onCommit}
          className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground"
        >
          Add task
        </button>
      </div>
    </div>
  );
}