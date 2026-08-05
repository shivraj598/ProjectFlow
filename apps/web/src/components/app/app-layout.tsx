import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/app/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";

function BootLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-xs">Loading workspace...</span>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const { accessToken, user, setUser, currentOrgId } = useAuthStore();
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: any }>("/api/auth/me", { headers: {} }),
    enabled: !!accessToken,
    retry: false,
  });

  useEffect(() => {
    if (data?.user) setUser(data.user);
  }, [data, setUser]);

  if (!accessToken) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (isLoading && !user) return <BootLoader />;

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <main className="pl-60">
        <div className="mx-auto h-full w-full max-w-[1500px]">
          {children ?? <Outlet key={currentOrgId} />}
        </div>
      </main>
    </div>
  );
}