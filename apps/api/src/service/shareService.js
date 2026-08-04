import Collection from '../model/collection.js';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w780';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => HTML_ESCAPES[char]);

/** Crawler-readable Open Graph page for a shared Collection. Statically escapes every
 * user-supplied field (name, description) before interpolation, and redirects human
 * browsers into the SPA's hash route via both a meta-refresh (works without JS) and a
 * script (immediate, for browsers that already loaded the body). */
const renderSharePage = ({
  title,
  description,
  image,
  canonicalUrl,
  redirectUrl,
}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
${image === null ? '' : `<meta property="og:image" content="${escapeHtml(image)}">\n`}<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${escapeHtml(redirectUrl)}">
</head>
<body>
<p>Redirecting to <a href="${escapeHtml(redirectUrl)}">Flix</a>&hellip;</p>
<script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>
`;

const ShareService = {
  /** Resolves `publicId` (a Collection's `_id` or legacy `legacyPublicId`) the same way
   * `SocialService.getPublicCollection` does, and renders its Open Graph card. Returns
   * `null` for a missing or private Collection so the controller can 404 without leaking
   * any of its fields. The canonical URL always uses the Collection's own `_id`, even when
   * `publicId` was a legacy id, so link previews converge on one indexable URL. */
  async renderCollectionCard(publicId, origin) {
    const collection = await Collection.findOne({
      $or: [{ _id: publicId }, { legacyPublicId: publicId }],
    }).populate('ownerId', 'username');
    if (collection === null || collection.visibility === 'private') return null;

    const canonicalId = collection._id.toString();
    const canonicalPath = `/u/${collection.ownerId.username}/collections/${canonicalId}`;
    const posterPath = collection.items.find(item => item.posterPath !== null)?.posterPath;
    return renderSharePage({
      title: `${collection.name} · Flix`,
      description:
        collection.description ??
        `A Collection of ${collection.items.length} title${collection.items.length === 1 ? '' : 's'} by ${collection.ownerId.username} on Flix.`,
      image: posterPath === undefined ? null : `${POSTER_BASE_URL}${posterPath}`,
      canonicalUrl: `${origin}${canonicalPath}`,
      redirectUrl: `${origin}/#${canonicalPath}`,
    });
  },
};

export default ShareService;
