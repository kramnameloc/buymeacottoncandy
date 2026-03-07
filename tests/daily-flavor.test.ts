import { describe, expect, it } from "vitest";
import { getDailyFlavor, getDailyFlavorByDateKey, getDateKey } from "../src/lib/daily-flavor";

describe("daily flavor", () => {
  it("builds a stable local date key", () => {
    const date = new Date(2026, 2, 7, 12, 0, 0);
    expect(getDateKey(date)).toBe("2026-03-07");
  });

  it("returns same flavor for same date key", () => {
    const first = getDailyFlavorByDateKey("2026-03-07");
    const second = getDailyFlavorByDateKey("2026-03-07");
    expect(first).toEqual(second);
  });

  it("returns same flavor for same date instance", () => {
    const date = new Date(2026, 2, 7, 15, 20, 0);
    const first = getDailyFlavor(date);
    const second = getDailyFlavor(date);
    expect(first).toEqual(second);
  });
});
