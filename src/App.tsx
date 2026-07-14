import { Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import DashboardPage from "@/pages/DashboardPage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import RecentActivityPage from "@/pages/RecentActivityPage";
import OnboardingPage from "@/pages/OnboardingPage";
import PageTransition from "@/components/motion/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null; // wait for auth to resolve
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const LoadingScreen = () => (
  <div className="min-h-[100svh] bg-background flex items-center justify-center">
    <p className="text-muted text-label font-sans uppercase tracking-[0.08em]">
      Loading...
    </p>
  </div>
);

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <PageTransition>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflows"
              element={
                <ProtectedRoute>
                  <WorkflowsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <RecentActivityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </PageTransition>
    </MotionConfig>
  );
}
