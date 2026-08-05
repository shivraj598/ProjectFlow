import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ChevronRight, FolderKanban, SquareKanban } from "lucide-react";
import { api } from "@/lib/api";
import { Board } from "@/components/board/board";
import { PROJECT_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BoardPage({ projectId }: { projectId: string }) {
  const { data } = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => api<{ project: any }>(`/api/projects/${projectId}`),
    enabled: !!projectId,
  });

  const project = data?.project;
  const status = project ? (PROJECT_STATUS_META[project.status] ?? { label: project.status, dot: "#71717a" }) : null;

  return (
    <div className="flex h-full flex-col pb-0">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
        {project ? (
          <>
            <span className="flex size-7 items-center justify-center rounded-md font-mono text-[10px] font-bold text-white" style={{ backgroundColor: project.color }}>
              {project.key.slice(0, 3)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[14px] font-semibold">{project.name}</h1>
                {status && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                    {status.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Link to="/app/projects" className="hover:text-foreground">Projects</Link>
                <ChevronRight className="size-3" />
                <span className="truncate">{project.workspace?.name}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <SquareKanban className="size-4" /> Loading board...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {project ? <Board projectId={projectId} /> : null}
      </div>
    </div>
  );
}