import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { OperationsMenu } from "@/components/dashboard/OperationsMenu";

describe("OperationsMenu", () => {
  it("opens route links and closes with Escape", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <OperationsMenu />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /operations/i }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Workflows" })).toHaveAttribute("href", "/workflows");
    expect(screen.getByRole("menuitem", { name: "Recent Activity" })).toHaveAttribute("href", "/activity");
    expect(screen.getByRole("menuitem", { name: "Audit Trail" })).toHaveAttribute("href", "/audit");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when clicking outside the menu", () => {
    render(
      <MemoryRouter initialEntries={["/activity"]}>
        <div data-testid="outside" />
        <OperationsMenu />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /operations/i }));
    fireEvent.pointerDown(screen.getByTestId("outside"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("marks nested audit routes as active", () => {
    render(
      <MemoryRouter initialEntries={["/audit/event-1"]}>
        <OperationsMenu />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /operations/i })).toHaveClass("text-primary");
  });
});
