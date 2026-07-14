import { useClient } from "@/hooks/useClient";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import { RunsFeed } from "@/components/dashboard/RunsFeed";

export default function RecentActivityPage() {
  const { data: client, isLoading, error } = useClient();

  return (
    <>
      <Nav />
      <main className="pt-16 px-[clamp(24px,5vw,80px)] py-[clamp(64px,10vw,128px)]">
        <SectionHeader label="01 - Recent Activity" />
        {isLoading && <p style={{ color: "#6B6762" }}>Loading activity...</p>}
        {error && <p style={{ color: "#A13A32" }}>Failed to load activity. Please refresh.</p>}
        {!isLoading && !error && !client && <p style={{ color: "#6B6762" }}>No client workspace found.</p>}
        {!isLoading && !error && client && <RunsFeed />}
      </main>
      <Footer />
    </>
  );
}
