import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import PageTransition from "@/components/motion/PageTransition";
import RouteScrollRestoration from "@/components/motion/RouteScrollRestoration";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LegalGate from "@/components/legal/LegalGate";
import PostHogConsentSync from "@/components/analytics/PostHogConsentSync";
import PostHogRouteTracker from "@/components/analytics/PostHogRouteTracker";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AcceptInvitePage = lazy(() => import("@/pages/AcceptInvitePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const WorkflowsPage = lazy(() => import("@/pages/WorkflowsPage"));
const RecentActivityPage = lazy(() => import("@/pages/RecentActivityPage"));
const AuditPage = lazy(() => import("@/pages/AuditPage"));
const AuditDetailPage = lazy(() => import("@/pages/AuditDetailPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const LegalDocumentPage = lazy(() => import("@/pages/LegalDocumentPage"));
const LegalConsentPage = lazy(() => import("@/pages/LegalConsentPage"));
const LegalSettingsPage = lazy(() => import("@/pages/LegalSettingsPage"));
const DemoPage = lazy(() => import("@/pages/DemoPage"));
const IntegrationsPage = lazy(() => import("@/pages/IntegrationsPage"));
const SecurityPage = lazy(() => import("@/pages/SecurityPage"));
const DataSynchronizationPage = lazy(() => import("@/pages/DataSynchronizationPage"));

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
      <PostHogConsentSync />
      <PostHogRouteTracker />
      <PageTransition>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
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
              path="/data-synchronization"
              element={
                <ProtectedRoute>
                  <DataSynchronizationPage />
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
          </Suspense>
        </ErrorBoundary>
      </PageTransition>
    </MotionConfig>
  );
}
