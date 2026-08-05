import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { FolderKanban, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { ProjectSummary } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PROJECT_STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";

export function ProjectsPage() {
  const { currentOrgId } = useAuthStore();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ["org-projects", currentOrgId],
    queryFn: () => api<{ projects: ProjectSummary[] }>(`/api/orgs/${currentOrgId}/projects`),
    enabled: !!currentOrgId,
  });

  const projects = data?.projects ?? [];

  function swatch(key: string) {
    return projects.find((p) => p.key === key)?.color ?? "#5b8cff";
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"} across your organization
          </p>
        </div>
        <CreateProjectDialog
          onCreated={(id) => navigate(`/app/projects/${id}`)}
          trigger={
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">
              <Plus className="size-4" /> New project
            </button>
          }
        />
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to spin up a kanban board with a default workflow."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const status = PROJECT_STATUS_META[p.status] ?? { label: p.status, dot: "#71717a" };
            return (
              <Link
                key={p.id}
                to={`/app/projects/${p.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ backgroundColor: p.color }} />
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-white" style={{ backgroundColor: p.color }}>
                    {p.key.slice(0, 3)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold">{p.name}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{p.workspace.name}</p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                  {p.description || "No description"}
                </p>

                <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                    {status.label}
                  </span>
                  <span>{p._count.tasks} tasks</span>
                  {p.lead && (
                    <span className="ml-auto inline-flex items-center gap-1.5" title={p.lead.name}>
                      <UserAvatar name={p.lead.name} className="size-5 text-[9px]" />
                    </span>
                  )}
                  <span className="hidden sm:inline">{formatDate(p.createdAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}