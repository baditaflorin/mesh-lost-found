import { describe, it, expect } from "vitest";
import { validListing } from "../../src/Feature";
describe("listing validation", () => {
  it("requires safe useful item metadata", () => {
    expect(validListing("Keys", "Near the east door")).toBe(true);
    expect(validListing("x", "no")).toBe(false);
    expect(validListing("Keys", "x")).toBe(false);
  });
});
