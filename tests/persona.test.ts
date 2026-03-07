import { describe, expect, it } from "vitest";
import { personaFromInput, personaFromSeed } from "../src/lib/persona";

describe("persona generation", () => {
  it("returns the same persona for the same input", () => {
    const a = personaFromInput("Captain Swirl");
    const b = personaFromInput("Captain Swirl");

    expect(a).toEqual(b);
  });

  it("rebuilds the same persona from seed", () => {
    const fromInput = personaFromInput("Cloud Ranger");
    expect(fromInput).toBeTruthy();

    const fromSeed = personaFromSeed(fromInput!.seed);
    expect(fromSeed).toEqual(fromInput);
  });
});
