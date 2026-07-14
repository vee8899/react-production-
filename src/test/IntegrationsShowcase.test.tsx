import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IntegrationsShowcase from "@/components/features/IntegrationsShowcase";

describe("IntegrationsShowcase", () => {
  it("renders grouped integration examples", () => {
    render(<IntegrationsShowcase />);

    expect(screen.getByText("Communication")).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();

    [
      "Gmail",
      "Outlook",
      "WhatsApp",
      "Telegram",
      "Slack",
      "Google Calendar",
      "Google Sheets",
      "Google Docs",
    ].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("describes integrations as examples instead of live tenant data", () => {
    render(<IntegrationsShowcase />);

    expect(screen.getByText(/example integration surfaces/i)).toBeInTheDocument();
    expect(screen.queryByText(/connected to your account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/live tenant/i)).not.toBeInTheDocument();
  });
});
