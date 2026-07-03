// This package exposes the generated Zod validation schemas for the API.
// Only the schemas (from ./generated/api) are part of the public surface.
// The generated TypeScript types (./generated/types) are NOT re-exported here:
// they are consumed via @workspace/api-client-react, and re-exporting them
// would collide with the like-named Zod schemas for any operation that has
// both a path param and a query param (e.g. update/delete with `id` + `ownerKey`).
export * from "./generated/api";
