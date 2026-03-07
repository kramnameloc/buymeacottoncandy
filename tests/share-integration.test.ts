import { describe, expect, it } from "vitest";
import { applyStateFromUrl, buildShareUrl } from "../src/lib/share-state";

describe("share link integration", () => {
  it("restores tier/flavor/theme from a share URL", () => {
    const url = buildShareUrl(
      {
        tier: "mini-puff",
        flavor: "blue-raspberry-breeze",
        theme: "carnival"
      },
      "https://buymeacottoncandy.com/"
    );

    const restored = applyStateFromUrl(new URL(url).searchParams);

    expect(restored.tier).toBe("mini-puff");
    expect(restored.flavor).toBe("blue-raspberry-breeze");
    expect(restored.theme).toBe("carnival");
  });

  it("preserves receipt context for reopenable receipt links", () => {
    const url = buildShareUrl(
      {
        tier: "galaxy-fluff",
        flavor: "premium-altitude",
        theme: "sunset",
        receipt: "CANDY-20260307-A1B2C3"
      },
      "https://buymeacottoncandy.com/"
    );

    const restored = applyStateFromUrl(new URL(url).searchParams);

    expect(restored).toEqual({
      tier: "galaxy-fluff",
      flavor: "premium-altitude",
      theme: "sunset",
      receipt: "CANDY-20260307-A1B2C3"
    });
  });
});
