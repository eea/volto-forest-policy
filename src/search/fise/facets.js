import { objectProvides, issued_date } from '../common';

import { makeRange } from '@eeacms/search';

const countries = {
  field: 'country.keyword',
  factory: 'MultiTermFacet',
  label: 'Country',
  showInFacetsList: true,
  filterType: 'any',
  isFilterable: false,
  show: 10000,
  isMulti: true,
  // sortOn: 'custom',
  // sortOnCustomLabel: 'Alphabetical',
  alwaysVisible: true,
};

const updateFrequency = {
  field: 'update_frequency_value.keyword',
  factory: 'MultiTermFacet',
  label: 'Update Frequency',
  showInFacetsList: true,
  filterType: 'any',
  isFilterable: false,
  show: 10000,
  isMulti: true,
  // sortOn: 'custom',
  // sortOnCustomLabel: 'Alphabetical',
  alwaysVisible: true,
};

// const publicationYearForResource = {
//   field: 'publicationYear.keyword',
//   factory: 'MultiTermFacet',
//   label: 'Publication Year',
//   showInFacetsList: true,
//   filterType: 'any',
//   isFilterable: false,
//   show: 10000,
//   isMulti: true,
//   // sortOn: 'custom',
//   // sortOnCustomLabel: 'Alphabetical',
//   alwaysVisible: true,
// };
const publicationYearHistogram = {
  field: 'publicationYear.keyword',
  factory: 'HistogramFacet',
  label: 'Publication Year Histogram',
  showInFacetsList: true,
  filterType: 'any',
  isFilterable: false,
  show: 10000,
  isMulti: true,
  ranges: makeRange({
    step: 1,
    normalRange: [1950, 2500],
    includeOutlierStart: false,
    includeOutlierEnd: false,
  }),
  step: 10,
  aggs_script: 'def vals = doc["publicationYear"]; return vals;',

  // sortOn: 'custom',
  // sortOnCustomLabel: 'Alphabetical',
  alwaysVisible: true,
};

objectProvides['alwaysVisible'] = true;

const facets = [
  objectProvides,
  countries,
  updateFrequency,
  // publicationYearForResource,
  publicationYearHistogram,
  issued_date,
];

export default facets;
