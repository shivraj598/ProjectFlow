import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove as sortableArrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, post, patch, del } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useSocket } from "@/hooks/use-socket";
import type { BoardData, Column, Task } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskSheet } from "./task-sheet";
import { toast } from "sonner";

function findContainer(columns: Column[], id: string): string | null {
  if (columns.some((c) => c.id === id)) return id;
  return columns.find((c) => c.tasks.some((t) => t.id === id))?.id ?? null;
}

interface ReorderPayload {
  orders: { columnId: string | null; taskIds: string[] }[];
}

export function Board({ projectId }: { projectId: string }) {
  const { currentOrgId } = useAuthStore();
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<Column[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const columnsRef = useRef<Column[] | null>(null);
  columnsRef.current = columns;

  const { data, isPending } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => api<BoardData>(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (data) {
      const key = data.project.key;
      setColumns(data.project.columns.map((c) => ({ ...c, tasks: c.tasks.map((t) => ({ ...t, projectKey: key })) })));
    }
  }, [data]);

  // realtime
  useSocket(
    projectId,
    (evt) => {
      if (evt === "board:reordered" || evt === "column:deleted" || evt === "task:deleted") {
        queryClient.invalidateQueries({ queryKey: ["board", projectId] });
      }
    },
    (evt) => {
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", currentOrgId] });
      void evt;
    }
  );

  const reorderMutation = useMutation({
    mutationFn: (payload: ReorderPayload) => post(`/api/projects/${projectId}/reorder`, payload),
    onError: () => {
      toast.error("Could not save the board, refreshing");
      queryClient.invalidateQueries({ queryKey: ["board", projectId] });
    },
  });

  const createTask = useMutation({
    mutationFn: (p: { columnId: string; title: string }) =>
      post(`/api/projects/${projectId}/tasks`, { title: p.title, columnId: p.columnId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add task"),
  });

  const renameColumn = useMutation({
    mutationFn: (p: { id: string; name: string }) => patch(`/api/projects/columns/${p.id}`, { name: p.name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const deleteColumn = useMutation({
    mutationFn: (id: string) => del(`/api/projects/columns/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {})
  );

  const canEdit = data?.myRole !== "MEMBER";

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setOverColumnId(findContainer(columnsRef.current ?? [], String(event.active.id)));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !columnsRef.current) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const cols = columnsRef.current;
    const activeContainer = findContainer(cols, activeIdStr);
    const overContainer = findContainer(cols, overIdStr);
    if (!activeContainer || !overContainer) return;

    setOverColumnId(overContainer);

    setColumns((prev) => {
      if (!prev) return prev;
      const source = prev.find((c) => c.id === activeContainer);
      const target = prev.find((c) => c.id === overContainer);
      if (!source || !target) return prev;

      if (activeContainer === overContainer) {
        const tasks = source.tasks;
        const oldIndex = tasks.findIndex((t) => t.id === activeIdStr);
        let newIndex = tasks.findIndex((t) => t.id === overIdStr);
        if (oldIndex < 0) return prev;
        if (newIndex < 0) newIndex = tasks.length;
        if (oldIndex === newIndex) return prev;
        return prev.map((c) => (c.id === source.id ? { ...c, tasks: sortableArrayMove(tasks, oldIndex, newIndex) } : c));
      }

      // cross-column
      const oldIndex = source.tasks.findIndex((t) => t.id === activeIdStr);
      if (oldIndex < 0) return prev;
      const activeTask = source.tasks[oldIndex];
      let newIndex = target.tasks.findIndex((t) => t.id === overIdStr);
      if (newIndex < 0) newIndex = target.tasks.length;
      const newTargetTasks = [...target.tasks];
      newTargetTasks.splice(newIndex, 0, activeTask);

      return prev.map((c) => {
        if (c.id === source.id) return { ...c, tasks: c.tasks.filter((t) => t.id !== activeIdStr) };
        if (c.id === target.id) return { ...c, tasks: newTargetTasks };
        return c;
      });
    });
  }

  function handleDragEnd(_event: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    const cols = columnsRef.current;
    if (!cols) return;
    reorderMutation.mutate({
      orders: cols.map((c) => ({ columnId: c.id, taskIds: c.tasks.map((t) => t.id) })),
    });
  }

  const activeTask = activeId && columns ? columns.flatMap((c) => c.tasks).find((t) => t.id === activeId) : null;
  const activeColumnId = activeTask ? findContainer(columns ?? [], activeTask.id) : null;

  if (isPending || !columns) {
    return (
      <div className="flex h-[calc(100dvh-8rem)] items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="size-2 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          setOverColumnId(null);
        }}
      >
        <div className="board-scroll flex h-[calc(100dvh-11.5rem)] items-start gap-3 overflow-x-auto px-6 pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              projectKey={data!.project.key}
              canEdit={canEdit}
              onOpenTask={setSelectedTaskId}
              onAddTask={(colId, title) => createTask.mutate({ columnId: colId, title })}
              onRenameColumn={(id, name) => renameColumn.mutate({ id, name })}
              onDeleteColumn={(id) => deleteColumn.mutate(id)}
              isOver={overColumnId === column.id && !!activeId}
            />
          ))}
          {canEdit && (
            <AddColumnButton
              onAdd={(name) => {
                post(`/api/projects/${projectId}/columns`, { name })
                  .then(() => queryClient.invalidateQueries({ queryKey: ["board", projectId] }))
                  .catch((e) => toast.error(e instanceof Error ? e.message : "Failed"));
              }}
            />
          )}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="pointer-events-none w-[286px]">
              <TaskCard task={activeTask} columnId={activeColumnId ?? ""} onOpen={() => {}} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTaskId && data && (
        <TaskSheet
          taskId={selectedTaskId}
          columns={columns}
          members={data.members}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}
    </>
  );
}

function AddColumnButton({ onAdd }: { onAdd: (name: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex h-10 w-[290px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-[13px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
      >
        <span className="text-lg leading-none">+</span> Add column
      </button>
    );
  }
  return (
    <div className="w-[290px] shrink-0 rounded-xl border border-border bg-card p-2.5">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) {
            onAdd(name.trim());
            setName("");
            setAdding(false);
          }
          if (e.key === "Escape") setAdding(false);
        }}
        placeholder="Column name"
        className="mb-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex justify-end gap-2">
        <button className="text-[12px] text-muted-foreground" onClick={() => setAdding(false)}>
          Cancel
        </button>
        <button
          className="rounded-md bg-primary px-2.5 py-1 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
          disabled={!name.trim()}
          onClick={() => {
            onAdd(name.trim());
            setName("");
            setAdding(false);
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}