import { objectProvides, issued_date } from '../common';

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

objectProvides['alwaysVisible'] = true;

const facets = [objectProvides, countries, updateFrequency, issued_date];

export default facets;
