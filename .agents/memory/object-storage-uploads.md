---
name: Object storage uploads
description: How file upload/storage is wired into this app and why private downloads are event-scoped.
---

# Object storage uploads

Object storage (App Storage / GCS) follows the `object-storage` skill: a sidecar GCS service,
presigned upload URLs, and a private object dir. Endpoints live under `/api/storage/*`.

## Upload flow (two-step presigned URL)
1. `POST /api/storage/uploads/request-url` (JSON metadata only) → `{ uploadURL, objectPath }`.
2. `PUT` the file bytes directly to `uploadURL` (GCS) — never to our backend.
3. Store `objectPath` (e.g. `/objects/uploads/<uuid>`) on the owning record.

The frontend uses a small hook (no Uppy lib) returning `{ objectPath, fileName }`; the
object-storage-web package was intentionally NOT added (single consumer, avoids peer conflicts).

## Downloads must be scoped to the owning record — do NOT serve private objects generically
**Decision:** there is NO generic `GET /storage/objects/*` route for private uploads. Files are
served only through an owner-scoped endpoint that verifies the object belongs to the requested
parent before streaming (logistics documents: `GET /events/:eventId/documents/:docId/file`, which
checks `doc.eventId === eventId` and `doc.filePath`).

**Why:** this app has NO server-side auth at all — "login" is a hardcoded client-side
`localStorage` flag and every API route is unauthenticated. A generic private-object route would
make any uploaded file globally reachable by its (random but global) object key. Object-key
randomness is not an access-control boundary. Scoping retrieval to the parent record is the only
real protection available without inventing an auth system the rest of the app doesn't have.

**How to apply:** any new file-bearing entity gets its own `…/:parentId/<entity>/:id/file` route
that re-checks ownership; never reintroduce a catch-all private object server. The public-objects
route (`/storage/public-objects/*`) is fine — it only serves PUBLIC_OBJECT_SEARCH_PATHS app assets.

**Template gotcha:** the copied `objectStorage.ts` had a strict-TS error — `response.json()` is
`unknown`, so the `signed_url` destructure needs an explicit cast. Otherwise leave the sidecar
GCS setup untouched.
