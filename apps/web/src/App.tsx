import { Navigate, Route, Routes, useParams } from "react-router";
import { AppLayout } from "@/components/app/app-layout";
import { LandingPage } from "@/pages/landing";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { DashboardPage } from "@/pages/app/dashboard";
import { ProjectsPage } from "@/pages/app/projects";
import { BoardPage } from "@/pages/app/board";
import { PeoplePage } from "@/pages/app/people";
import { SettingsPage } from "@/pages/app/settings";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<BoardRoute />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function BoardRoute() {
  const { projectId } = useParams();
  return <BoardPage projectId={projectId ?? ""} />;
}