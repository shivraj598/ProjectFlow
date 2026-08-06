import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { ChevronRight, Plus, Target, Calendar, Users } from "lucide-react";
import { sprintApi } from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import { SPRINT_STATUS_META, type SprintStatus } from "@/lib/constants";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, cn } from "@/lib/utils";
import { CreateSprintDialog } from "@/components/sprint/create-sprint-dialog";

export function SprintsPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SprintStatus | "all">("all");

  useSocket(projectId, (evt) => {
    if (evt.startsWith("sprint:")) {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    }
  });

  const { data, isPending } = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintApi.list(projectId),
    enabled: !!projectId,
  });

  const sprints = data?.sprints ?? [];

  const filteredSprints = activeTab === "all"
    ? sprints
    : sprints.filter((s) => s.status === activeTab);

  const tabs: { value: SprintStatus | "all"; label: string; icon: typeof Target }[] = [
    { value: "all", label: "All sprints", icon: Target },
    { value: "PLANNED", label: "Planned", icon: Target },
    { value: "ACTIVE", label: "Active", icon: Target },
    { value: "COMPLETED", label: "Completed", icon: Target },
    { value: "CANCELLED", label: "Cancelled", icon: Target },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/app/projects"
            className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-3 rotate-180" /> Projects
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Sprints</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {sprints.length} sprint{activeTab !== "all" && ` (${filteredSprints.length} ${activeTab.toLowerCase()})`}
          </p>
        </div>
        <CreateSprintDialog
          projectId={projectId}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
          }}
          trigger={
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">
              <Plus className="size-4" /> New sprint
            </button>
          }
        />
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const count = sprints.filter((s) => tab.value === "all" || s.status === tab.value).length;
          const meta = tab.value !== "all" ? SPRINT_STATUS_META[tab.value] : null;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <tab.icon className={cn("size-3.5", meta?.color)} />
              {tab.label} <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : filteredSprints.length === 0 ? (
        <EmptyState
          icon={Target}
          title={activeTab === "all" ? "No sprints yet" : `No ${activeTab.toLowerCase()} sprints`}
          description={
            activeTab === "all"
              ? "Create your first sprint to start organizing work into fixed development cycles."
              : `No sprints with status "${activeTab}" found.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredSprints.map((sprint) => {
            const status = SPRINT_STATUS_META[sprint.status];
            const progress = sprint.totalStoryPoints > 0
              ? Math.round((sprint.completedStoryPoints / sprint.totalStoryPoints) * 100)
              : 0;
            const isActive = sprint.status === "ACTIVE";
            const isCompleted = sprint.status === "COMPLETED";

            return (
              <Link
                key={sprint.id}
                to={`/app/projects/${projectId}/sprints/${sprint.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: status.dot }}
                />
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-white"
                    style={{ backgroundColor: status.dot }}
                  >
                    <status.icon className="size-4" strokeWidth={3} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold">{sprint.name}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">{status.label}</p>
                  </div>
                </div>

                {sprint.goal && (
                  <p className="mt-3 line-clamp-2 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                    {sprint.goal}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {(sprint.startDate || sprint.endDate) && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span>
                        {sprint.startDate ? formatDate(sprint.startDate) : "No start"} —{" "}
                        {sprint.endDate ? formatDate(sprint.endDate) : "No end"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>{sprint.members.length} member{sprint.members.length !== 1 ? "s" : ""}</span>
                    <span className="mx-1">•</span>
                    <span>{sprint._count.tasks} task{sprint._count.tasks !== 1 ? "s" : ""}</span>
                  </div>
                  {sprint.totalStoryPoints > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: isCompleted ? "#22c55e" : isActive ? "#5b8cff" : "#94a3b8",
                          }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {sprint.completedStoryPoints} / {sprint.totalStoryPoints} story points
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                  <span>Created {formatDate(sprint.createdAt)}</span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    View <ChevronRight className="size-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}