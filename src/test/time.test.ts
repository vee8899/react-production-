import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime } from "@/utils/time";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set "now" to 2026-07-02T10:00:00Z
    vi.setSystemTime(new Date("2026-07-02T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "0 mins ago" for the current time', () => {
    expect(formatRelativeTime("2026-07-02T10:00:00Z")).toBe("0 mins ago");
  });

  it('returns "1 min ago" for one minute ago', () => {
    expect(formatRelativeTime("2026-07-02T09:59:00Z")).toBe("1 min ago");
  });

  it('returns "5 mins ago" for five minutes ago', () => {
    expect(formatRelativeTime("2026-07-02T09:55:00Z")).toBe("5 mins ago");
  });

  it('returns "1 hr ago" for one hour ago', () => {
    expect(formatRelativeTime("2026-07-02T09:00:00Z")).toBe("1 hr ago");
  });

  it('returns "3 hrs ago" for three hours ago', () => {
    expect(formatRelativeTime("2026-07-02T07:00:00Z")).toBe("3 hrs ago");
  });

  it('returns "1 day ago" for one day ago', () => {
    expect(formatRelativeTime("2026-07-01T10:00:00Z")).toBe("1 day ago");
  });

  it('returns "2 days ago" for two days ago', () => {
    expect(formatRelativeTime("2026-06-30T10:00:00Z")).toBe("2 days ago");
  });
});