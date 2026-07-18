import { Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import DashboardPage from "@/pages/DashboardPage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import RecentActivityPage from "@/pages/RecentActivityPage";
import AuditPage from "@/pages/AuditPage";
import AuditDetailPage from "@/pages/AuditDetailPage";
import OnboardingPage from "@/pages/OnboardingPage";
import LegalDocumentPage from "@/pages/LegalDocumentPage";
import LegalConsentPage from "@/pages/LegalConsentPage";
import LegalSettingsPage from "@/pages/LegalSettingsPage";
import DemoPage from "@/pages/DemoPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import SecurityPage from "@/pages/SecurityPage";
import PageTransition from "@/components/motion/PageTransition";
import RouteScrollRestoration from "@/components/motion/RouteScrollRestoration";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LegalGate from "@/components/legal/LegalGate";

export const ProtectedRoute = ({
  children,
  checkLegal = true,
}: {
  children: React.ReactNode;
  checkLegal?: boolean;
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null; // wait for auth to resolve
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return checkLegal ? <LegalGate>{children}</LegalGate> : <>{children}</>;
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
      <RouteScrollRestoration />
      <PageTransition>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
            <Route
              path="/demo"
              element={
                <ProtectedRoute>
                  <DemoPage />
                </ProtectedRoute>
              }
            />
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
              path="/activity/:runId"
              element={
                <ProtectedRoute>
                  <RecentActivityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <AuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit/:eventId"
              element={
                <ProtectedRoute>
                  <AuditDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <ProtectedRoute>
                  <IntegrationsPage />
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
            <Route path="/legal/terms" element={<LegalDocumentPage documentKey="terms_of_service" />} />
            <Route path="/legal/privacy" element={<LegalDocumentPage documentKey="privacy_policy" />} />
            <Route
              path="/legal/consent"
              element={
                <ProtectedRoute checkLegal={false}>
                  <LegalConsentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal/settings"
              element={
                <ProtectedRoute checkLegal={false}>
                  <LegalSettingsPage />
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
