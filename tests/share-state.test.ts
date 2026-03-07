import { describe, expect, it } from "vitest";
import { applyStateFromUrl, buildShareUrl } from "../src/lib/share-state";

describe("share state URL contract", () => {
  it("round-trips tier/flavor/theme/receipt state", () => {
    const url = buildShareUrl(
      {
        tier: "blue-whirl",
        flavor: "sea-salt-sky",
        theme: "sunset",
        receipt: "CANDY-20260307-AB12CD"
      },
      "https://buymeacottoncandy.com/"
    );

    const parsed = applyStateFromUrl(new URL(url).searchParams);

    expect(parsed).toEqual({
      tier: "blue-whirl",
      flavor: "sea-salt-sky",
      theme: "sunset",
      receipt: "CANDY-20260307-AB12CD",
      persona: undefined
    });
  });

  it("drops invalid URL state", () => {
    const params = new URLSearchParams("tier=not-real&flavor=nope&theme=invalid&receipt=hello");
    const parsed = applyStateFromUrl(params);

    expect(parsed).toEqual({
      tier: undefined,
      flavor: undefined,
      theme: undefined,
      receipt: undefined,
      persona: undefined
    });
  });
});
