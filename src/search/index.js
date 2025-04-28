import installFiseSearch from './fise/config';

const extraQueryParams = {
  text_fields: [
    'title^4',
    'subject^1.5',
    'description^1.5',
    'all_fields_for_freetext',
  ],
  functions: [
    {
      exp: {
        'issued.date': {
          offset: '1800d',
          scale: '3600d',
        },
      },
    },
  ],
  score_mode: 'sum',
};

const applyConfig = (config) => {
  config.settings.searchlib = [installFiseSearch].reduce(
    (acc, cur) => cur(acc),
    config.settings.searchlib,
  );

  const searchui = config.settings.searchlib.searchui;
  searchui.fiseSearch.extraQueryParams = extraQueryParams;

  return config;
};
export default applyConfig;
