import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, FolderPlus, Layers, Plus, Trash2 } from "lucide-react";
import { api, del, patch, post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { OrgDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SettingsPage() {
  const { currentOrgId } = useAuthStore();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["org", currentOrgId],
    queryFn: () => api<{ org: OrgDetail }>(`/api/orgs/${currentOrgId}`),
    enabled: !!currentOrgId,
  });

  const org = data?.org;

  const renameOrg = useMutation({
    mutationFn: (name: string) => patch(`/api/orgs/${currentOrgId}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      queryClient.invalidateQueries({ queryKey: ["org", currentOrgId] });
      toast.success("Organization updated");
    },
  });

  const addWorkspace = useMutation({
    mutationFn: (name: string) => post(`/api/orgs/${currentOrgId}/workspaces`, { name }),
    onSuccess: (res: any) => {
      queryClient.setQueryData<{ org: OrgDetail }>(["org", currentOrgId], (old) =>
        old ? { org: { ...old.org, workspaces: [...old.org.workspaces, res.workspace] } } : old
      );
      toast.success("Workspace created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteWorkspace = useMutation({
    mutationFn: (id: string) => del(`/api/workspaces/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", currentOrgId] });
      queryClient.invalidateQueries({ queryKey: ["org-projects", currentOrgId] });
      toast.success("Workspace deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!org) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Manage your organization and workspaces.</p>
      </div>

      {/* Organization */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Building2 className="size-4" />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold">Organization</h2>
            <p className="text-[11px] text-muted-foreground">Edit the name shown to every member</p>
          </div>
        </div>
        <OrgRenameForm name={org.name} onSubmit={renameOrg.mutate} />
      </section>

      <Separator className="my-1" />

      {/* Workspaces */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            <h2 className="text-[14px] font-semibold">Workspaces</h2>
          </div>
          <AddWorkspaceForm onSubmit={addWorkspace.mutate} />
        </div>
        <div className="space-y-2">
          {org.workspaces.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Layers className="size-3.5 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{w.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {w.projects.length} project{w.projects.length === 1 ? "" : "s"}
                  {w.description ? ` · ${w.description}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteWorkspace.mutate(w.id)}
                aria-label="Delete workspace"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OrgRenameForm({ name, onSubmit }: { name: string; onSubmit: (name: string) => void }) {
  const [value, setValue] = useState(name);
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="max-w-xs" />
      <Button variant="outline" disabled={value.trim().length < 2 || value.trim() === name} onClick={() => onSubmit(value.trim())}>
        Save
      </Button>
    </div>
  );
}

function AddWorkspaceForm({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" /> New workspace
      </Button>
    );
  }
  return (
    <div className={cn("flex items-center gap-2")}>
      <Label htmlFor="ws" className="sr-only">Workspace name</Label>
      <Input
        id="ws"
        value={name}
        autoFocus
        placeholder="e.g. Mobile"
        className="h-8 w-40 text-[12px]"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) {
            onSubmit(name.trim());
            setName("");
            setOpen(false);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <Button
        size="sm"
        className="h-8"
        disabled={name.trim().length < 2}
        onClick={() => {
          onSubmit(name.trim());
          setName("");
          setOpen(false);
        }}
      >
        Create
      </Button>
    </div>
  );
}