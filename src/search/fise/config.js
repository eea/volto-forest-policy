import { mergeConfig } from '@eeacms/search';
import { getClientProxyAddress } from '../utils';
import { build_runtime_mappings } from '@eeacms/volto-globalsearch/utils';

import facets from './facets';
import views from './views';

const fiseConfig = {
  title: 'FISE Search',
  ...views,
};

const clusters = {
  name: 'op_cluster',
  field: 'objectProvides',
  clusters: [],
};

export default function installFiseSearch(config) {
  const envConfig = fiseConfig;

  const pjson = require('@eeacms/volto-forest-policy/../package.json');

  envConfig.app_name = pjson.name;
  envConfig.app_version = pjson.version;

  config.searchui.fiseSearch = {
    ...mergeConfig(envConfig, config.searchui.globalsearchbase),
    elastic_index: '_es/fiseSearch',
    index_name:
      process.env.RAZZLE_RESOURCE_CATALOG_INDEX || 'fise_sdi_searchui_prod',
    host: process.env.RAZZLE_ES_PROXY_ADDR || 'http://localhost:3000',
    runtime_mappings: build_runtime_mappings(clusters),
  };

  config.searchui.fiseSearch.download_fields = [
    { field: 'about', name: 'About' },
    { field: 'title', name: 'Title' },
    { field: 'created', name: 'Creation Date' },
    { field: 'issued', name: 'Publication Date' },
    { field: 'publicationYear', name: 'Publishing year' },
    { field: 'creators', name: 'Creator' },
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
