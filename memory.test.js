import { describe, it, expect, beforeEach } from "vitest";
import { Memory } from "./memory.js";

describe("Memory", () => {
  let memory;
  let mockStorage;
  let mockState;

  beforeEach(() => {
    // Mock storage object
    mockStorage = {
      data: new Map(),
      async get(key) {
        return this.data.get(key) || null;
      },
      async put(key, value) {
        this.data.set(key, value);
      },
      async delete(key) {
        this.data.delete(key);
      },
    };

    // Mock state with storage
    mockState = {
      storage: mockStorage,
    };

    // Create Memory instance
    memory = new Memory(mockState);
  });

  describe("GET /get endpoint", () => {
    it("should return empty array when no history exists", async () => {
      const request = new Request("https://example.com/get");
      const response = await memory.fetch(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
      expect(response.headers.get("content-type")).toBe("application/json");
    });

    it("should return stored history", async () => {
      const testHistory = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ];
      await mockStorage.put("history", testHistory);

      const request = new Request("https://example.com/get");
      const response = await memory.fetch(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(testHistory);
    });
  });

  describe("POST /save endpoint", () => {
    it("should save history to storage", async () => {
      const testHistory = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ];

      const request = new Request("https://example.com/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testHistory),
      });

      const response = await memory.fetch(request);

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toBe("ok");

      // Verify storage was updated
      const stored = await mockStorage.get("history");
      expect(stored).toEqual(testHistory);
    });

    it("should overwrite existing history", async () => {
      // Set initial history
      const initialHistory = [{ role: "user", content: "Old message" }];
      await mockStorage.put("history", initialHistory);

      // Save new history
      const newHistory = [{ role: "user", content: "New message" }];
      const request = new Request("https://example.com/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHistory),
      });

      await memory.fetch(request);

      // Verify old history was replaced
      const stored = await mockStorage.get("history");
      expect(stored).toEqual(newHistory);
      expect(stored).not.toEqual(initialHistory);
    });
  });

  describe("404 handling", () => {
    it("should return 404 for unknown endpoints", async () => {
      const request = new Request("https://example.com/unknown");
      const response = await memory.fetch(request);

      expect(response.status).toBe(404);
      const body = await response.text();
      expect(body).toBe("Found");
    });

    it("should return 404 for root path", async () => {
      const request = new Request("https://example.com/");
      const response = await memory.fetch(request);

      expect(response.status).toBe(404);
    });
  });

  describe("URL pathname parsing", () => {
    it("should handle /get with query parameters", async () => {
      const request = new Request("https://example.com/get?foo=bar");
      const response = await memory.fetch(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
    });

    it("should handle /save with different URL formats", async () => {
      const testHistory = [{ role: "user", content: "Test" }];
      const request = new Request("https://do.example.com/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testHistory),
      });

      const response = await memory.fetch(request);
      expect(response.status).toBe(200);
    });
  });
});

