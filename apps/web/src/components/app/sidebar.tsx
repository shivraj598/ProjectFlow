import { NavLink, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, KanbanSquare, Plus, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { ProjectSummary } from "@/lib/types";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "projects", label: "Projects", icon: KanbanSquare },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { currentOrgId } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["org-projects", currentOrgId],
    queryFn: () => api<{ projects: ProjectSummary[] }>(`/api/orgs/${currentOrgId}/projects`),
    enabled: !!currentOrgId,
  });

  const projects = data?.projects ?? [];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
          PF
        </div>
        <span className="text-[14px] font-semibold tracking-tight">ProjectFlow</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="px-2 pt-2">
        <OrgSwitcher />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </span>
            <CreateProjectButton />
          </div>
          {projects.length > 0 ? (
            projects.slice(0, 12).map((p) => (
              <NavLink
                key={p.id}
                to={`/app/projects/${p.id}`}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )
                }
              >
                <span className="size-2 shrink-0 rounded-[3px]" style={{ backgroundColor: p.color }} />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))
          ) : (
            <p className="px-2 text-[12px] text-muted-foreground">No projects yet</p>
          )}
        </div>

        <div>
          <span className="block px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Manage
          </span>
          <div className="mt-1 space-y-0.5">
            <SidebarLink item={{ to: "people", label: "People", icon: Users }} />
            <SidebarLink item={{ to: "settings", label: "Settings", icon: Settings }} />
          </div>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <UserMenu />
      </div>
    </aside>
  );

  type InnerSidebarLink = (typeof NAV)[number];
  function SidebarLink({ item }: { item: InnerSidebarLink }) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
          )
        }
      >
        <item.icon className="size-4 shrink-0" />
        {item.label}
      </NavLink>
    );
  }

  function CreateProjectButton() {
    return (
      <CreateProjectDialog
        trigger={
          <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Plus className="size-3.5" />
          </button>
        }
        onCreated={(id) => navigate(`/app/projects/${id}`)}
      />
    );
  }
}