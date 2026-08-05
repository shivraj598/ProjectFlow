import {
  BookMarked,
  BookOpen,
  Bug,
  CircleDot,
  Square,
  type LucideIcon,
} from "lucide-react";

export type Priority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type TaskType = "EPIC" | "STORY" | "TASK" | "BUG" | "SUBTASK";
export type Role = "ADMIN" | "MANAGER" | "MEMBER";

export const PRIORITIES: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"];

export const PRIORITY_META: Record<Priority, { label: string; color: string; dot: string }> = {
  URGENT: { label: "Urgent", color: "text-rose-500", dot: "#f43f5e" },
  HIGH: { label: "High", color: "text-orange-500", dot: "#f97316" },
  MEDIUM: { label: "Medium", color: "text-amber-500", dot: "#f59e0b" },
  LOW: { label: "Low", color: "text-slate-400", dot: "#94a3b8" },
  NONE: { label: "No priority", color: "text-muted-foreground", dot: "#71717a" },
};

export const TASK_TYPES: TaskType[] = ["EPIC", "STORY", "TASK", "BUG", "SUBTASK"];

export const TYPE_META: Record<TaskType, { label: string; icon: LucideIcon; color: string }> = {
  EPIC: { label: "Epic", icon: BookMarked, color: "text-violet-500" },
  STORY: { label: "Story", icon: BookOpen, color: "text-sky-500" },
  TASK: { label: "Task", icon: Square, color: "text-muted-foreground" },
  BUG: { label: "Bug", icon: Bug, color: "text-rose-500" },
  SUBTASK: { label: "Subtask", icon: CircleDot, color: "text-slate-400" },
};

export const PROJECT_COLORS = [
  "#5b8cff",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

export const PROJECT_STATUS_META: Record<string, { label: string; dot: string }> = {
  PLANNED: { label: "Planned", dot: "#94a3b8" },
  ACTIVE: { label: "Active", dot: "#22c55e" },
  ON_HOLD: { label: "On hold", dot: "#f59e0b" },
  COMPLETED: { label: "Completed", dot: "#5b8cff" },
  ARCHIVED: { label: "Archived", dot: "#71717a" },
};

export const ROLE_META: Record<Role, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  MANAGER: { label: "Manager", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  MEMBER: { label: "Member", className: "bg-muted text-muted-foreground border-transparent" },
};
