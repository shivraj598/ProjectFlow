import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { queryClient } from "@/lib/query-client";
import type { OrgSummary } from "@/lib/types";
import { toast } from "sonner";
import { initials } from "@/lib/utils";

function OrgMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={`flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[11px] font-bold text-primary ${className ?? ""}`}
    >
      {initials(name)}
    </span>
  );
}

export function OrgSwitcher() {
  const navigate = useNavigate();
  const { currentOrgId, setCurrentOrg } = useAuthStore();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["orgs"],
    queryFn: () => api<{ orgs: OrgSummary[] }>("/api/orgs"),
    staleTime: 60_000,
  });

  const orgs = data?.orgs ?? [];
  const current = orgs.find((o) => o.id === currentOrgId) ?? orgs[0];

  function selectOrg(orgId: string) {
    setCurrentOrg(orgId);
    queryClient.invalidateQueries({ queryKey: ["org", orgId] });
    navigate("/app");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-10 w-full items-center justify-start gap-2.5 px-2 hover:bg-accent/60"
        >
          {current ? (
            <>
              <OrgMark name={current.name} />
              <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                <span className="max-w-[150px] truncate text-[13px] font-semibold">{current.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {current.role.toLowerCase()} · {current._count.projects} projects
                </span>
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Building2 className="size-4" /> Select organization
            </span>
          )}
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
        {orgs.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => selectOrg(o.id)} className="gap-2.5">
            <OrgMark name={o.name} />
            <span className="flex-1 truncate text-[13px]">{o.name}</span>
            {o.id === current?.id && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setOpen(true)} className="gap-2 text-[13px]">
          <Plus className="size-4" /> New organization
        </DropdownMenuItem>
      </DropdownMenuContent>

      <CreateOrgDialog open={open} onOpenChange={setOpen} />
    </DropdownMenu>
  );
}

export function CreateOrgDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { setCurrentOrg } = useAuthStore();

  async function create() {
    if (name.trim().length < 2 || busy) return;
    setBusy(true);
    try {
      const res = await post<{ org: OrgSummary }>("/api/orgs", { name: name.trim() });
      queryClient.setQueryData<{ orgs: OrgSummary[] }>(["orgs"], (old) => ({
        orgs: old ? [res.org, ...old.orgs] : [res.org],
      }));
      setCurrentOrg(res.org.id);
      queryClient.invalidateQueries({ queryKey: ["org", res.org.id] });
      toast.success(`Organization ${res.org.name} created`);
      onOpenChange(false);
      setName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create organization");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create an organization</DialogTitle>
          <DialogDescription>Organizations keep your workspaces, projects and members isolated.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="org-name">Organization name</Label>
          <Input
            id="org-name"
            placeholder="e.g. Fathom Studio"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={create} disabled={busy || name.trim().length < 2}>
            {busy ? "Creating..." : "Create organization"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
