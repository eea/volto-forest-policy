import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers';
import redraft from 'redraft';
import { compact, concat, isArray, join, map, pickBy, toPairs } from 'lodash';
import config from '@plone/volto/registry';

const url = require('url');

export function getBasePath(url) {
  return flattenToAppURL(getBaseUrl(url));
}

export function getLocation(href) {
  var match = href.match(
    /^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/,
  );
  return (
    match && {
      href: href,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7],
    }
  );
}

export function samePath(url, path) {
  // returns true if the router path is equal to the given url path
  const parsed = getLocation(url);
  const clean = getBasePath(url)
    .replace(parsed.hash, '')
    .replace(parsed.search, '')
    .replace(/\/$/, '');

  const cleanPath = path.replace(/\/$/, '');
  return clean === cleanPath;
}

export function dataToQueryString(data) {
  let queryArray = [];
  const arrayOptions = pickBy(data, (item) => isArray(item));

  queryArray = concat(
    queryArray,
    data
      ? join(
          map(toPairs(pickBy(data, (item) => !isArray(item))), (item) => {
            if (item[0] === 'SearchableText') {
              // Adds the wildcard to the SearchableText param
              item[1] = `${item[1]}*`;
            }
            return join(item, '=');
          }),
          '&',
        )
      : '',
  );

  queryArray = concat(
    queryArray,
    arrayOptions
      ? join(
          map(pickBy(arrayOptions), (item, key) =>
            join(
              item.map((value) => `${key}:list=${value}`),
              '&',
            ),
          ),
          '&',
        )
      : '',
  );

  const querystring = join(compact(queryArray), '&');
  return querystring;
}

// if URL matches a defined cors proxy destination, then use the cors proxy
export function useCorsproxy(targetUrl) {
  const allowed_cors_destinations =
    config.settings.allowed_cors_destinations || [];
  const parsed = url.parse(targetUrl);
  const nextUrl =
    allowed_cors_destinations.indexOf(parsed.host) === -1
      ? targetUrl
      : `/cors-proxy/${targetUrl}`;
  // console.log('url is', nextUrl, parsed.host, allowed_cors_destinations);
  return nextUrl;
}

export function renderDraft(draftValue) {
  return draftValue
    ? redraft(
        draftValue,
        config.settings.ToHTMLRenderers,
        config.settings.ToHTMLOptions,
      )
    : '';
}
