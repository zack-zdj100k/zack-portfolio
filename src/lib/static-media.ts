/**
 * Built-in images ship in /public and are registered in Media with a "public:<url>" key. When they
 * are moved to Cloudinary (scripts/media-to-cloudinary.ts) they get this fixed key instead, so the
 * seed can recognise them and never registers the same picture twice.
 */
export const staticCloudKey = (url: string) => `images/static${url}`;

/** Built-in files that stay with the site: the hero's artwork, depth map and 3D model are read by
 * WebGL (no lossy CDN re-encoding, no cross-origin loading), and are part of the code anyway. */
export const keepWithSite = (url: string) => url.startsWith("/hero/") || !/\.(webp|png|jpe?g|avif)$/i.test(url);
