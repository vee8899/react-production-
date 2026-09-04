import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IntegrationsShowcase from "@/components/features/IntegrationsShowcase";

describe("IntegrationsShowcase", () => {
  it("groups communication integrations under the Communication heading", () => {
    render(<IntegrationsShowcase />);

    expect(screen.getByText("Communication")).toBeInTheDocument();
    ["Gmail", "Outlook", "WhatsApp", "Telegram", "Slack"].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("groups workspace integrations under the Workspace heading", () => {
    render(<IntegrationsShowcase />);

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    [
      "Google Calendar",
      "Google Sheets",
      "Google Docs",
    ].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("describes integrations as examples instead of live tenant data", () => {
    render(<IntegrationsShowcase />);

    expect(screen.getByText(/example adapters for your modules/i)).toBeInTheDocument();
    expect(screen.queryByText(/connected to your account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/live tenant/i)).not.toBeInTheDocument();
  });
});
