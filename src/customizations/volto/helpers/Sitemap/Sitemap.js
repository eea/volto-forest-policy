/**
 * Sitemap helper.
 *
 * Customized from @plone/volto/helpers/Sitemap/Sitemap to stop the generated
 * URLs being polluted with the internal pod address, e.g.
 *
 *   http://10.42.184.199:3000https://forest.eea.europa.eu/data/...
 *
 * Cause: Volto's server.jsx (itself shadowed by volto-eea-website-theme)
 * overwrites the *process-wide* `config.settings.publicURL` on every request,
 * derived from that request's `Host` header. Kubernetes health probes on /ok
 * arrive with the pod's own address as Host, so they poison that value. The
 * upstream helper reads `publicURL` *late* -- inside the async callback, after
 * the @search query returns -- so any probe landing in that window corrupts
 * the whole batch.
 *
 * Fix: resolve the public URL once, synchronously, before the request is
 * issued, from sources that cannot be mutated at runtime; then build the URLs
 * from that captured value instead of reading the shared global.
 *
 * @module helpers/Sitemap
 */

import superagent from 'superagent';
import map from 'lodash/map';
import zlib from 'zlib';
import { addHeadersFactory } from '@plone/volto/helpers/Proxy/Proxy';

import config from '@plone/volto/registry';

export const SITEMAP_BATCH_SIZE = 5000;

/**
 * True for addresses that can never be the site's public URL (pod IPs,
 * cluster-internal names), so they are never used to build sitemap URLs.
 * @function isInternalHost
 * @param {string} host Hostname, optionally with port
 * @return {boolean} True if the host is cluster-internal
 */
const isInternalHost = (host) => {
  if (!host) return true;
  const hostname = host.split(':')[0];
  return (
    hostname === 'localhost' ||
    !hostname.includes('.') ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
};

/**
 * Extract the public origin from a VirtualHostBase style internal API path,
 * e.g. http://backend:8080/VirtualHostBase/https/forest.eea.europa.eu:443/fise/VirtualHostRoot
 * yields https://forest.eea.europa.eu
 * @function originFromVirtualHostBase
 * @param {string} internalApiPath Internal API path
 * @return {string} Public origin, or undefined when not a VirtualHostBase path
 */
const originFromVirtualHostBase = (internalApiPath) => {
  const match = /\/VirtualHostBase\/(https?)\/([^/:]+)(?::(\d+))?\//.exec(
    internalApiPath || '',
  );
  if (!match) return undefined;
  const [, scheme, host, port] = match;
  const isDefaultPort =
    !port ||
    (scheme === 'https' && port === '443') ||
    (scheme === 'http' && port === '80');
  return `${scheme}://${host}${isDefaultPort ? '' : `:${port}`}`;
};

/**
 * Resolve the site's public origin, in order of trustworthiness. Called
 * synchronously at request entry so the value cannot be changed by concurrent
 * requests while the sitemap is being generated.
 * @function resolvePublicURL
 * @param {Object} req Request object
 * @return {string} Public origin without trailing slash
 */
export const resolvePublicURL = (req) => {
  const { settings } = config;

  // 1. Read straight from the environment. Unlike config.settings.publicURL
  //    this is never rewritten per request.
  const fromEnv = process.env.RAZZLE_PUBLIC_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  // 2. Derive it from the VirtualHostBase in the internal API path, which
  //    already encodes the public scheme, host and port.
  const fromVHM = originFromVirtualHostBase(
    process.env.RAZZLE_INTERNAL_API_PATH || settings.internalApiPath,
  );
  if (fromVHM) return fromVHM;

  // 3. Fall back to this request's own headers, captured now rather than read
  //    later, and only when they don't look cluster-internal.
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  if (!isInternalHost(host)) {
    const scheme = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    return `${scheme}://${host}`;
  }

  // 4. Last resort: whatever the registry currently holds.
  return (settings.publicURL || '').replace(/\/$/, '');
};

/**
 * Reduce a backend URL to a site-root-relative path, then re-root it on the
 * resolved public origin. Replaces @plone/volto's toPublicURL, which reads the
 * mutable config.settings.publicURL.
 * @function toPublicURLWith
 * @param {string} publicURL Resolved public origin
 * @param {string} url URL of the object
 * @return {string} Public URL
 */
const toPublicURLWith = (publicURL, url) => {
  const { settings } = config;
  let path = url || '';

  [
    settings.internalApiPath,
    process.env.RAZZLE_INTERNAL_API_PATH,
    publicURL,
    settings.publicURL,
    settings.apiPath,
  ].forEach((prefix) => {
    if (prefix && path.startsWith(prefix)) {
      path = path.slice(prefix.length);
    }
  });

  // Anything still absolute is reduced to its path, so a polluted prefix can
  // never survive into the output.
  if (/^https?:\/\//.test(path)) {
    try {
      const parsed = new URL(path);
      path = `${parsed.pathname}${parsed.search}`;
    } catch (e) {
      path = path.replace(/^https?:\/\/[^/]*/, '');
    }
  }

  if (path && !path.startsWith('/')) path = `/${path}`;
  return `${publicURL}${path}`;
};

/**
 * Escape the characters that are not allowed raw inside an XML element.
 * @function escapeXML
 * @param {string} value Value to escape
 * @return {string} Escaped value
 */
const escapeXML = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Generate sitemap
 * @function generateSitemap
 * @param {Object} _req Request object
 * @return {string} Generated sitemap
 */
export const generateSitemap = (_req, start = 0, size = undefined) =>
  new Promise((resolve) => {
    const { settings } = config;
    const APISUFIX = settings.legacyTraverse ? '' : '/++api++';
    const apiPath = settings.internalApiPath ?? settings.apiPath;
    // Resolved before the async request, so concurrent traffic cannot change it.
    const publicURL = resolvePublicURL(_req);
    const request = superagent.get(
      `${apiPath}${APISUFIX}/@search?metadata_fields=modified&b_start=${start}&b_size=${
        size !== undefined ? size : 100000000
      }&use_site_search_settings=1`,
    );
    request.set('Accept', 'application/json');
    request.use(addHeadersFactory(_req));
    const authToken = _req.universalCookies.get('auth_token');
    if (authToken) {
      request.set('Authorization', `Bearer ${authToken}`);
    }
    request.end((error, { body } = {}) => {
      if (error) {
        resolve(body || error);
      } else {
        const items = map(body.items, (item) => {
          const loc = escapeXML(toPublicURLWith(publicURL, item['@id']));
          const lastmod = item.modified
            ? `\n    <lastmod>${escapeXML(item.modified)}</lastmod>`
            : '';
          return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
        });
        const result = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n${items.join(
          '\n',
        )}\n</urlset>`;
        zlib.gzip(Buffer.from(result, 'utf8'), (_err, buffer) => {
          resolve(buffer);
        });
      }
    });
  });

/**
 * Generate sitemap index
 * @function generateSitemapIndex
 * @param {Object} _req Request object
 * @return {string} Generated sitemap index
 */
export const generateSitemapIndex = (_req, gzip = false) =>
  new Promise((resolve) => {
    const { settings } = config;
    const APISUFIX = settings.legacyTraverse ? '' : '/++api++';
    const apiPath = settings.internalApiPath ?? settings.apiPath;
    const publicURL = resolvePublicURL(_req);
    const request = superagent.get(
      `${apiPath}${APISUFIX}/@search?metadata_fields=modified&b_size=0&use_site_search_settings=1`,
    );
    request.set('Accept', 'application/json');
    const authToken = _req.universalCookies.get('auth_token');
    if (authToken) {
      request.set('Authorization', `Bearer ${authToken}`);
    }
    request.end((error, { body } = {}) => {
      if (error) {
        resolve(body || error);
      } else {
        const items = Array.from(
          { length: Math.ceil(body.items_total / SITEMAP_BATCH_SIZE) },
          (_, i) =>
            `  <sitemap>
    <loc>${escapeXML(
      toPublicURLWith(publicURL, `/sitemap${i + 1}.xml.gz`),
    )}</loc>
  </sitemap>`,
        );
        const result = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}\n</sitemapindex>`;

        if (gzip) {
          zlib.gzip(Buffer.from(result, 'utf8'), (_err, buffer) => {
            resolve(buffer);
          });
        } else {
          resolve(result);
        }
      }
    });
  });
