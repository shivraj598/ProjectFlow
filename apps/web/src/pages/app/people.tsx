import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Plus, Trash2, UserRoundPlus } from "lucide-react";
import { api, del, post } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { OrgDetail } from "@/lib/types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { ROLE_META, type Role } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function PeoplePage() {
  const { currentOrgId } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["org", currentOrgId],
    queryFn: () => api<{ org: OrgDetail }>(`/api/orgs/${currentOrgId}`),
    enabled: !!currentOrgId,
  });

  const org = data?.org;

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => del(`/api/orgs/${currentOrgId}/members/${memberId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["org", currentOrgId] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not remove member"),
  });

  if (isPending || !org) {
    return <div className="space-y-3 p-6">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/60" />)}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">People</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {org.members.length} member{org.members.length === 1 ? "" : "s"} in {org.name}
          </p>
        </div>
        <InviteDialog />
      </div>

      {org.members.length === 0 ? (
        <EmptyState icon={UserRoundPlus} title="No members" description="Invite teammates to start collaborating." />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {org.members.map((m, i) => (
            <li key={m.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-border/70")}>
              <UserAvatar name={m.user.name} src={m.user.avatarUrl} seed={m.user.name} className="size-9 text-[12px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{m.user.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{m.user.email}</p>
              </div>
              <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", ROLE_META[m.role].className)}>
                {ROLE_META[m.role].label}
              </span>
              {org.ownerId !== m.user.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMutation.mutate(m.id)}
                  aria-label="Remove member"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InviteDialog() {
  const { currentOrgId } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [busy, setBusy] = useState(false);

  const invite = useMutation({
    mutationFn: () => post(`/api/orgs/${currentOrgId}/invites`, { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", currentOrgId] });
      setEmail("");
      setRole("MEMBER");
      setOpen(false);
      toast.success("Invitation sent");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not invite"),
  });

  return (
    <>
      <Button className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Invite
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get access to your organization's projects and boards.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="teammate@company.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={busy || !email.includes("@")}
              onClick={() => {
                setBusy(true);
                invite
                  .mutateAsync()
                  .catch(() => {})
                  .finally(() => setBusy(false));
              }}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}