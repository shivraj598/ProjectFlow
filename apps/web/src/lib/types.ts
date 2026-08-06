import type { Priority, Role, TaskType, SprintStatus } from "@/lib/constants";

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: Role;
  workspaces: { id: string; name: string }[];
  _count: { members: number; projects: number };
}

export interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  ownerId: string;
  members: {
    id: string;
    role: Role;
    createdAt: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }[];
  workspaces: {
    id: string;
    name: string;
    description: string | null;
    projects: { id: string; name: string; key: string; color: string; status: string }[];
  }[];
  _count: { projects: number };
}

export interface ProjectSummary {
  id: string;
  orgId: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  color: string;
  icon: string | null;
  leadId: string | null;
  status: string;
  createdAt: string;
  workspace: { id: string; name: string };
  lead: { id: string; name: string } | null;
  _count: { tasks: number; columns: number };
}

export interface Task {
  id: string;
  projectId: string;
  sprintId: string | null;
  columnId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  priority: Priority;
  assigneeId: string | null;
  reporterId: string | null;
  dueDate: string | null;
  storyPoints: number | null;
  labels: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  assignee?: { id: string; name: string; avatarUrl: string | null } | null;
  reporter?: { id: string; name: string; avatarUrl: string | null } | null;
  _count?: { comments: number };
  projectKey?: string;
}

export interface Column {
  id: string;
  projectId: string;
  name: string;
  position: number;
  wipLimit: number | null;
  createdAt: string;
  tasks: Task[];
}

export interface BoardProject {
  id: string;
  orgId: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  color: string;
  status: string;
  createdAt: string;
  workspace: { id: string; name: string };
  lead: { id: string; name: string } | null;
  columns: Column[];
}

export interface BoardData {
  project: BoardProject;
  members: {
    id: string;
    role: Role;
    user: { id: string; name: string; avatarUrl: string | null; email: string };
  }[];
  myRole: Role;
}

export interface SprintMember {
  id: string;
  sprintId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null; email: string };
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  members: SprintMember[];
  _count: { tasks: number };
  totalStoryPoints: number;
  completedStoryPoints: number;
  tasks?: {
    id: string;
    storyPoints: number | null;
    completedAt: string | null;
    column: { name: string } | null;
  }[];
}

export interface SprintBurndown {
  burndown: { date: string; ideal: number; actual: number }[];
  totalPoints: number;
  sprintStart: string;
  sprintEnd: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  actor: { id: string; name: string; avatarUrl: string | null } | null;
  task: { id: string; title: string } | null;
}

export interface DashboardData {
  totals: {
    projects: number;
    tasks: number;
    completed: number;
    overdue: number;
    dueSoon: number;
    inProgress: number;
    members: number;
    completionRate: number;
  };
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byAssignee: { user: { id: string; name: string; avatarUrl: string | null }; count: number }[];
  trend: { date: string; created: number; completed: number }[];
  recentActivity: Activity[];
  activeProjects: { id: string; name: string; key: string; color: string; status: string; taskCount: number }[];
}
