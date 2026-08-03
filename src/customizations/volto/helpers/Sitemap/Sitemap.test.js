import zlib from 'zlib';
import config from '@plone/volto/registry';
import {
  generateSitemap,
  generateSitemapIndex,
  resolvePublicURL,
} from './Sitemap';

let mockBody = {};
let mockDuringAsyncGap = null;

jest.mock('superagent', () => ({
  get: () => ({
    set: () => {},
    use: () => {},
    end: (cb) => {
      // Anything registered here runs between issuing the request and the
      // callback, i.e. inside the window a health probe would land in.
      if (mockDuringAsyncGap) mockDuringAsyncGap();
      cb(null, { body: mockBody });
    },
  }),
}));

jest.mock('@plone/volto/helpers/Proxy/Proxy', () => ({
  addHeadersFactory: () => () => {},
}));

const VHB =
  'http://backend:8080/VirtualHostBase/https/forest.eea.europa.eu:443/fise/VirtualHostRoot';
const POD = 'http://10.42.184.199:3000';

const req = (headers = { host: 'forest.eea.europa.eu' }) => ({
  headers,
  protocol: 'https',
  universalCookies: { get: () => undefined },
});

const gunzip = (buffer) => zlib.gunzipSync(buffer).toString('utf8');

describe('Sitemap helper', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    delete process.env.RAZZLE_PUBLIC_URL;
    delete process.env.RAZZLE_INTERNAL_API_PATH;
    config.settings = {
      ...config.settings,
      internalApiPath: VHB,
      apiPath: 'https://forest.eea.europa.eu',
      publicURL: 'https://forest.eea.europa.eu',
      legacyTraverse: false,
    };
    mockBody = {};
    mockDuringAsyncGap = null;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('resolvePublicURL', () => {
    it('prefers RAZZLE_PUBLIC_URL and trims a trailing slash', () => {
      process.env.RAZZLE_PUBLIC_URL = 'https://forest.eea.europa.eu/';
      expect(resolvePublicURL(req())).toBe('https://forest.eea.europa.eu');
    });

    it('derives the origin from a VirtualHostBase internal path', () => {
      expect(resolvePublicURL(req())).toBe('https://forest.eea.europa.eu');
    });

    it('keeps a non-default port from VirtualHostBase', () => {
      config.settings.internalApiPath =
        'http://backend:8080/VirtualHostBase/https/example.org:8443/site/VirtualHostRoot';
      expect(resolvePublicURL(req())).toBe('https://example.org:8443');
    });

    it('falls back to the request host when there is no VirtualHostBase', () => {
      config.settings.internalApiPath = 'http://backend:8080/fise';
      expect(
        resolvePublicURL(
          req({ host: 'forest.eea.europa.eu', 'x-forwarded-proto': 'https' }),
        ),
      ).toBe('https://forest.eea.europa.eu');
    });

    it('never builds a public URL from a cluster-internal host', () => {
      config.settings.internalApiPath = 'http://backend:8080/fise';
      config.settings.publicURL = 'https://forest.eea.europa.eu';
      expect(resolvePublicURL(req({ host: '10.42.184.199:3000' }))).toBe(
        'https://forest.eea.europa.eu',
      );
    });
  });

  describe('generateSitemap', () => {
    it('does not concatenate the origin onto an already absolute @id', async () => {
      mockBody = {
        items: [
          {
            '@id': 'https://forest.eea.europa.eu/data/roundwood',
            modified: '2026-01-01T00:00:00+00:00',
          },
        ],
      };
      const xml = gunzip(await generateSitemap(req()));
      expect(xml).toContain(
        '<loc>https://forest.eea.europa.eu/data/roundwood</loc>',
      );
    });

    it('resists the config being poisoned during the async gap', async () => {
      mockBody = {
        items: [
          {
            '@id': 'https://forest.eea.europa.eu/data/roundwood',
            modified: '2026-01-01T00:00:00+00:00',
          },
        ],
      };
      mockDuringAsyncGap = () => {
        config.settings.publicURL = POD;
        config.settings.apiPath = POD;
      };
      const xml = gunzip(await generateSitemap(req()));
      expect(xml).toContain(
        '<loc>https://forest.eea.europa.eu/data/roundwood</loc>',
      );
      expect(xml).not.toContain('10.42.184.199');
    });

    it('captures early enough even when only the registry value is available', async () => {
      config.settings.internalApiPath = 'http://backend:8080/fise';
      mockBody = {
        items: [{ '@id': 'http://backend:8080/fise/policy', modified: null }],
      };
      mockDuringAsyncGap = () => {
        config.settings.publicURL = POD;
      };
      const xml = gunzip(
        await generateSitemap(req({ host: 'localhost:3000' })),
      );
      expect(xml).toContain('<loc>https://forest.eea.europa.eu/policy</loc>');
      expect(xml).not.toContain('10.42.184.199');
    });

    it('omits lastmod when the item has no modified date', async () => {
      mockBody = {
        items: [{ '@id': 'https://forest.eea.europa.eu/policy' }],
      };
      const xml = gunzip(await generateSitemap(req()));
      expect(xml).not.toContain('<lastmod>');
      expect(xml).not.toContain('undefined');
    });

    it('escapes XML-significant characters in URLs', async () => {
      mockBody = {
        items: [{ '@id': 'https://forest.eea.europa.eu/a?x=1&y=2' }],
      };
      const xml = gunzip(await generateSitemap(req()));
      expect(xml).toContain('x=1&amp;y=2');
    });
  });

  describe('generateSitemapIndex', () => {
    it('builds batch URLs on the resolved origin', async () => {
      mockBody = { items_total: 6000 };
      const xml = await generateSitemapIndex(req());
      expect(xml).toContain(
        '<loc>https://forest.eea.europa.eu/sitemap1.xml.gz</loc>',
      );
      expect(xml).toContain(
        '<loc>https://forest.eea.europa.eu/sitemap2.xml.gz</loc>',
      );
    });

    it('resists the config being poisoned during the async gap', async () => {
      mockBody = { items_total: 1 };
      mockDuringAsyncGap = () => {
        config.settings.publicURL = POD;
      };
      const xml = await generateSitemapIndex(req());
      expect(xml).toContain(
        '<loc>https://forest.eea.europa.eu/sitemap1.xml.gz</loc>',
      );
      expect(xml).not.toContain('10.42.184.199');
    });
  });
});
