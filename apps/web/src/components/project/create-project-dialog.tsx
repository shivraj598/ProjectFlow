import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { queryClient } from "@/lib/query-client";
import { PROJECT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  trigger?: ReactNode;
  onCreated?: (id: string) => void;
}

export function CreateProjectDialog({ trigger, onCreated }: CreateProjectDialogProps) {
  const { currentOrgId } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    queryKey: ["org", currentOrgId],
    queryFn: () => api<{ org: any }>(`/api/orgs/${currentOrgId}`),
    enabled: !!currentOrgId && open,
  });

  const workspaces = data?.org?.workspaces ?? [];

  function openChanged(v: boolean) {
    setOpen(v);
    if (v && workspaces.length && !workspaceId) setWorkspaceId(workspaces[0].id);
  }

  function deriveKey(e: React.ChangeEvent<HTMLInputElement>) {
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setKey(clean);
  }

  async function create() {
    if (name.trim().length < 2 || key.length < 2 || !workspaceId || busy) return;
    setBusy(true);
    try {
      const res = await post<{ project: { id: string } }>(`/api/orgs/${currentOrgId}/projects`, {
        workspaceId,
        name: name.trim(),
        key,
        color,
        description: description.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["org-projects", currentOrgId] });
      toast.success(`Project ${key} created`);
      setOpen(false);
      setName("");
      setKey("");
      setDescription("");
      onCreated?.(res.project.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create project");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={openChanged}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>A project groups tasks into a shared kanban board with its own workflow.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace</Label>
            <div className="flex flex-wrap gap-2">
              {workspaces.map((w: { id: string; name: string }) => (
                <button
                  key={w.id}
                  onClick={() => setWorkspaceId(w.id)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-[13px] transition-colors",
                    workspaceId === w.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="space-y-2">
              <Label>Project name</Label>
              <Input placeholder="e.g. Mobile App" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input placeholder="MOB" value={key} onChange={deriveKey} disabled={busy} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-6 rounded-full transition-transform",
                    color === c && "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={create} disabled={busy || name.trim().length < 2 || key.length < 2 || !workspaceId}>
            {busy ? "Creating..." : "Create project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { LucideIcon };