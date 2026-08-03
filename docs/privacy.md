# Privacy

What personal data moviev2 stores, what's exposed publicly, and under what conditions.

## Data stored

| Data                                                                    | Model                                    | Exposure                                                                                                                                           |
| ----------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Username, email, bcrypt password hash, optional first/last name, gender | `User`                                   | Never returned in full — `toPublicUser`/`toSocialProfileDto` project only non-sensitive fields                                                     |
| Library entries (watch state, rating, notes, dates, progress)           | `LibraryEntry`                           | Always private to the owner — no public read path exists                                                                                           |
| Collections (name, description, items, cover)                           | `Collection`                             | Visibility-gated: `private` (owner + collaborators only), `unlisted` (anyone with the link), `public` (discoverable)                               |
| Follows                                                                 | `Follow`                                 | Follower/following _counts_ are public on an opted-in profile; the relationship itself is queryable only via those counts and `isFollowedByViewer` |
| Collection likes                                                        | `CollectionLike`                         | Only allowed on `public` Collections; contributes to a public `likeCount`                                                                          |
| Notifications + preferences (timezone, event toggles)                   | `Notification`, `NotificationPreference` | Private to the owner                                                                                                                               |

## Public profile opt-in

A profile is discoverable (`GET /api/social/profile/:username`, `GET
/api/social/collections`) only when the user has explicitly enabled
`social.publicProfile`. Until then, `SocialService.findPublicUser` returns the same
`user_not_found` 404 as a nonexistent username — a disabled profile never confirms the
account exists. `showFollowers`/`showFollowing` further scope what an opted-in
profile's page displays.

## Collection visibility

Every Collection defaults to `private` on creation. `unlisted` and `public` are
explicit, per-Collection choices the owner makes — nothing defaults to public. A
`public` Collection is discoverable via `CollectionDiscovery` and shareable via
`ShareService`'s crawler-readable Open Graph card
(`GET /u/:username/collections/:id`); an `unlisted` one is reachable only by its exact
URL (never listed in discovery) and still returns the crawler card so link previews
render, but is excluded from search/discovery indexing. A `private` Collection returns
`404` with no metadata to a non-owner, non-collaborator — including to `ShareService`,
so a private share link leaks nothing (no title, no thumbnail) even to a crawler.

## Legacy public IDs

Collections migrated from the legacy embedded-list feature retain their original
Mongo ObjectId as `legacyPublicId`, so old share links (`/u/:username/lists/:id`)
keep resolving to the same Collection after migration — see `docs/operations.md`
for the migration's history.

## Data retention and deletion

There is currently no self-service account or data deletion path. Deleting a
Collection or Library entry removes it immediately; there is no soft-delete or
retention window. Notifications are not automatically pruned.

## Known risk: the bearer token in `localStorage`

See `docs/security.md` for the client-side authentication token's retention and risk
profile — it's a security concern with a direct privacy consequence (session hijack
exposes everything above), so treat the two docs together when evaluating this area.
