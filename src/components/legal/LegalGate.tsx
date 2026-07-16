import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLegalConsent } from "@/hooks/useLegalConsent";
import { hasCompleteRequiredConsent } from "@/lib/legalConsent";

type LegalGateProps = {
  children: React.ReactNode;
};

export default function LegalGate({ children }: LegalGateProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: consentStatus, error: consentError, isLoading: consentLoading } = useLegalConsent();
  const navigate = useNavigate();

  const isLoading = authLoading || consentLoading;

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (consentError || !hasCompleteRequiredConsent(consentStatus)) {
      navigate("/legal/consent", { replace: true });
    }
  }, [isLoading, isAuthenticated, consentError, consentStatus, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return <>{children}</>;

  if (consentError || !hasCompleteRequiredConsent(consentStatus)) return null;

  return <>{children}</>;
}
