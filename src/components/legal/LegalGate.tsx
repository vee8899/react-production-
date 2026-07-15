import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLegalConsent } from "@/hooks/useLegalConsent";

type LegalGateProps = {
  children: React.ReactNode;
};

export default function LegalGate({ children }: LegalGateProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: consentStatus, isLoading: consentLoading } = useLegalConsent();
  const navigate = useNavigate();

  const isLoading = authLoading || consentLoading;

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (consentStatus === undefined) return;

    const allConsented = Object.values(consentStatus).every(Boolean);
    if (!allConsented) {
      navigate("/legal/consent", { replace: true });
    }
  }, [isLoading, isAuthenticated, consentStatus, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return <>{children}</>;

  const allConsented = consentStatus && Object.values(consentStatus).every(Boolean);
  if (!allConsented) return null;

  return <>{children}</>;
}
