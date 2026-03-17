import { objectProvides } from '../common';

import { makeRange, multiTermFacet } from '@eeacms/search';

import globalSearchBaseConfig from '@eeacms/volto-globalsearch/config/global-search-base-config.js';

const today = new Date();
const currentYear = today.getFullYear();

const excludedFields = new Set([
  'topic',
  'places',
  'spatial',
  'publishers.keyword',
  'contributors.keyword',
  'creators.keyword',
  'data_provenances_organisations.keyword',
  'un_sdgs.keyword',
  'typology.keyword',
  'dpsir.keyword',
  'language',
  'year',
  'readingTime',
  'subject.keyword',
  'subject.keyword_lc',
  'IncludeArchived',
  'cluster_name',
]);

const countries = {
  field: 'country.keyword',
  factory: 'MultiTermFacet',
  label: 'Country',
  showInFacetsList: true,
  filterType: 'any',
  isFilterable: false,
  show: 10000,
  isMulti: true,
  alwaysVisible: true,
};

const publicationYearHistogram = {
  field: 'publicationYear',
  factory: 'HistogramFacet',
  label: 'Publishing year',
  showInFacetsList: true,
  filterType: 'any',
  isFilterable: false,
  show: 10000,
  isMulti: true,
  ranges: makeRange({
    step: 1,
    normalRange: [1950, currentYear],
    includeOutlierStart: false,
    includeOutlierEnd: false,
  }),
  step: 10,
  aggs_script: 'def vals = doc["publicationYear"]; return vals;',
  alwaysVisible: true,
};

objectProvides['alwaysVisible'] = true;

const cluster = multiTermFacet({
  field: 'op_cluster',
  isFilterable: true,
  isMulti: true,
  label: 'Section',
  show: 10000,
  showInFacetsList: false,
  ignoreNLPWhenActive: true,
});

const facets = [
  ...globalSearchBaseConfig.facets.filter(
    (facet) => !excludedFields.has(facet.field),
  ),
  cluster,
  objectProvides,
  countries,
  publicationYearHistogram,
];

const timeCoverageIdx = facets.findIndex((f) => f.field === 'time_coverage');
if (timeCoverageIdx !== -1) {
  facets[timeCoverageIdx].alwaysVisible = true;
  facets.push(...facets.splice(timeCoverageIdx, 1));
}

const issuedFacet = facets.find((f) => f.field === 'issued.date');
if (issuedFacet) {
  issuedFacet.default = {
    ...(issuedFacet.default || {}),
    values: ['All time'],
  };
}

export default facets;
