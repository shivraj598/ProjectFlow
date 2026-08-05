import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, CircleUserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { post } from "@/lib/api";
import { initials } from "@/lib/utils";

export function UserMenu() {
  const navigate = useNavigate();
  const { user, refreshToken, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => post("/api/auth/logout", { refreshToken }),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate("/");
    },
  });

  const initialsStr = useMemo(() => (user ? initials(user.name) : "?"), [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent">
        <Avatar className="size-7">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
          ) : (
            <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
              {initialsStr}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[13px] font-medium">{user?.name ?? "Account"}</span>
          <span className="truncate text-[11px] text-muted-foreground">{user?.email}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-[13px]"
          onSelect={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}