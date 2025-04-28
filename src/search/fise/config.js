import { mergeConfig } from '@eeacms/search';
import { getClientProxyAddress } from '../utils';

import facets from './facets';
import views from './views';

const fiseConfig = {
  title: 'FISE Search',
  ...views,
};

const cca_build_runtime_mappings = {};

export default function installFiseSearch(config) {
  const envConfig = fiseConfig;

  const pjson = require('@eeacms/volto-forest-policy/../package.json');

  envConfig.app_name = pjson.name;
  envConfig.app_version = pjson.version;

  // debugger;
  config.searchui.fiseSearch = {
    ...mergeConfig(envConfig, config.searchui.globalsearchbase),
    elastic_index: '_es/fiseSearch',
    index_name: 'fise_sdi_searchui',
    host: process.env.RAZZLE_ES_PROXY_ADDR || 'http://localhost:3000',
    runtime_mappings: cca_build_runtime_mappings,
    // ...vocabs,
  };

  config.searchui.fiseSearch.download_fields = [
    // { field: 'cca_uid', name: 'UID' },
    { field: 'about', name: 'About' },
    { field: 'title', name: 'Title' },
    { field: 'created', name: 'Creation Date' },
    { field: 'issued', name: 'Publication Date' },
    { field: 'creators', name: 'Creator' },
    // { field: 'fulltext', name: 'Description' },
  ];

  const { fiseSearch } = config.searchui;

  fiseSearch.permanentFilters.push({
    term: {
      cluster_name: 'fise_sdi',
    },
  });

  fiseSearch.facets = facets;

  fiseSearch.initialView.tilesLandingPageParams.sections = [
    {
      id: 'types',
      title: 'Types',
      facetField: 'objectProvides',
      sortOn: 'alpha',
      icon: {
        family: 'Content types',
      },
    },
  ];

  if (typeof window !== 'undefined') {
    config.searchui.fiseSearch.host =
      process.env.RAZZLE_ES_PROXY_ADDR || getClientProxyAddress();
  }

  return config;
}
