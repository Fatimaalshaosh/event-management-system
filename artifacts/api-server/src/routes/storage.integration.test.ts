import { afterAll, describe, expect, it } from "vitest";
import { pool } from "@workspace/db";
import request from "supertest";
import app from "../app";

afterAll(async () => {
  await pool.end();
});

describe("POST /api/storage/uploads/request-url", () => {
  it("returns a presigned upload URL and normalized object path", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .send({ name: "briefing.pdf", size: 2048, contentType: "application/pdf" });

    expect(res.status).toBe(200);
    expect(res.body.uploadURL).toBeTypeOf("string");
    expect(res.body.objectPath).toBeTypeOf("string");
    expect(res.body.metadata).toMatchObject({
      name: "briefing.pdf",
      size: 2048,
      contentType: "application/pdf",
    });
  });

  it("returns 400 for a missing/invalid body", async () => {
    const res = await request(app)
      .post("/api/storage/uploads/request-url")
      .send({ name: "no-size.pdf" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/storage/public-objects/*", () => {
  it("returns 404 for an object that does not exist", async () => {
    const res = await request(app).get(
      `/api/storage/public-objects/missing-${Date.now()}.png`,
    );
    expect(res.status).toBe(404);
  });
});
