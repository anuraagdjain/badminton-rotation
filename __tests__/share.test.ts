import { describe, it, expect } from "vitest";
import { decodeShareData } from "../lib/share";

describe("decodeShareData", () => {
  it("should decode valid participants and court count", () => {
    const encoded = btoa(JSON.stringify(["Alice", "Bob", "Charlie"]));
    const result = decodeShareData(encoded, "2");
    expect(result).toEqual({
      participants: ["Alice", "Bob", "Charlie"],
      courtCount: 2,
    });
  });

  it("should decode single court with 2 participants", () => {
    const encoded = btoa(JSON.stringify(["Alice", "Bob"]));
    const result = decodeShareData(encoded, "1");
    expect(result).toEqual({
      participants: ["Alice", "Bob"],
      courtCount: 1,
    });
  });

  it("should return null for invalid base64", () => {
    const result = decodeShareData("not-valid-base64!!!", "2");
    expect(result).toBeNull();
  });

  it("should return null for missing courts", () => {
    const encoded = btoa(JSON.stringify(["Alice", "Bob"]));
    const result = decodeShareData(encoded, "invalid");
    expect(result).toBeNull();
  });

  it("should return null for courts out of range (0)", () => {
    const encoded = btoa(JSON.stringify(["Alice", "Bob"]));
    const result = decodeShareData(encoded, "0");
    expect(result).toBeNull();
  });

  it("should return null for courts out of range (4)", () => {
    const encoded = btoa(JSON.stringify(["Alice", "Bob"]));
    const result = decodeShareData(encoded, "4");
    expect(result).toBeNull();
  });

  it("should return null for less than 2 participants", () => {
    const encoded = btoa(JSON.stringify(["Alice"]));
    const result = decodeShareData(encoded, "1");
    expect(result).toBeNull();
  });

  it("should return null for empty participants array", () => {
    const encoded = btoa(JSON.stringify([]));
    const result = decodeShareData(encoded, "1");
    expect(result).toBeNull();
  });

  it("should return null for non-array JSON", () => {
    const encoded = btoa(JSON.stringify({ name: "Alice" }));
    const result = decodeShareData(encoded, "1");
    expect(result).toBeNull();
  });

  it("should handle 20 participants", () => {
    const participants = Array.from({ length: 20 }, (_, i) => `Player ${i + 1}`);
    const encoded = btoa(JSON.stringify(participants));
    const result = decodeShareData(encoded, "3");
    expect(result?.participants).toHaveLength(20);
    expect(result?.courtCount).toBe(3);
  });
});
