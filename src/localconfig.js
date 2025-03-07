import { defineMessages } from 'react-intl';

import TokenWidget from '@plone/volto/components/manage/Widgets/TokenWidget';

import ForestMetadata from '@eeacms/volto-forest-policy/components/theme/Viewlets/ForestMetadata';

import './slate-styles.less';

// import { uniqBy } from 'lodash';

defineMessages({
  custom_addons: {
    id: 'custom_addons',
    defaultMessage: 'Custom Addons',
  },
  plotly_chart: {
    id: 'plotly_chart',
    defaultMessage: 'Plotly Chart',
  },
  demo_chart: {
    id: 'demo_chart',
    defaultMessage: 'Demo Chart',
  },
  tableau: {
    id: 'tableau',
    defaultMessage: 'Tableau',
  },
  forests_specific: {
    id: 'forests_specific',
    defaultMessage: 'Forests Specific Blocks',
  },
});

function addViewlets(config) {
  if (config.viewlets && config.viewlets.length > 0) {
    config.viewlets.push({ path: '/', component: ForestMetadata });
  }
  if (!config.viewlets) {
    config = {
      ...config,
      viewlets: [{ path: '/', component: ForestMetadata }],
    };
  }
}

export function applyConfig(config) {
  addViewlets(config);

  config.settings = {
    ...config.settings,
    navDepth: 4,
    repo: 'eea/forests-frontend',
    // richTextEditorInlineToolbarButtons: [
    //   // Underline,
    //   ...config.settings.richTextEditorInlineToolbarButtons,
    // ],
    nonContentRoutes: [
      // handled differently in getBaseUrl
      ...config.settings.nonContentRoutes,
      '/manage-slider',
      '/unauthorized',
    ],
    ownDomain: 'forest.eea.europa.eu',
    matomoSiteId: 46,
    // ...['navigation', '&expand.navigation.depth=3'],
  };

  // config.views = {
  //   ...config.views,
  //   layoutViews: {
  //     ...config.views.layoutViews,
  //     full_view: CountryView,
  //     // country_tab_view: CountryPageView,
  //     // ...layoutViews,
  //     news_item_listing_view: NewsView,
  //     refresh_view: RefreshView,
  //     // document_view_wide: DefaultViewWide,
  //     redirect_view: RedirectView,
  //   },
  // };

  delete config.views.contentTypesViews['News Item'];
  delete config.views.contentTypesViews['Event'];

  // read @plone/volto/components/manage/Form/Field.jsx to understand this
  config.widgets = {
    ...config.widgets,
    vocabulary: {
      ...config.widgets.vocabulary,
      'fise.topics': TokenWidget,
      'fise.keywords': TokenWidget,
      'fise.publishers': TokenWidget,
    },
  };

  config.blocks = {
    ...config.blocks,

    // comment block order because it removes most used grouping
    // groupBlocksOrder: [
    //   { id: 'common_blocks', title: 'Common blocks' },
    //   { id: 'forests_specific', title: 'Forests Specific Blocks' },
    //   ...uniqBy(config.blocks.groupBlocksOrder, 'id').filter(
    //     (block) => !['text', 'mostUsed', 'media', 'common'].includes(block.id),
    //   ),
    // ],

    // comment hide of text, mostUsed, media and common
    // blocksConfig: {
    //   ...Object.keys(config.blocks.blocksConfig).reduce((acc, blockKey) => {
    //     if (
    //       ['text', 'mostUsed', 'media', 'common'].includes(
    //         config.blocks.blocksConfig[blockKey].group,
    //       )
    //     ) {
    //       acc[blockKey] = {
    //         ...config.blocks.blocksConfig[blockKey],
    //         group: 'common_blocks',
    //       };
    //     } else {
    //       acc[blockKey] = config.blocks.blocksConfig[blockKey];
    //     }
    //     return acc;
    //   }, {}),
    // },
  };

  // config.viewlets = [
  //   ...config.viewlets,
  //   { path: '/', component: ForestMetadata },
  // ];

  config.settings.plotlyCustomColors = [
    {
      title: 'Forest Default',
      colorscale: [
        '#005c30',
        '#168130',
        '#6fb22c',
        '#bed492',
        '#ffffff',
        '#ecf0c5',
        '#000000',
      ],
    },
    {
      title: 'Forest Active',
      colorscale: [
        '#b94d1f ',
        '#d9d9d9',
        '#b92e48',
        '#005e7d',
        '#000000',
        '#ffffff',
      ],
    },
  ];

  config.settings.slate = config.settings.slate || {};
  config.settings.slate.styleMenu = config.settings.slate.styleMenu || {};
  config.settings.slate.styleMenu.inlineStyles = [
    ...(config.settings.slate.styleMenu?.inlineStyles || []),
    { cssClass: 'large-text', label: 'Large text' },
    { cssClass: 'primary-big-text', label: 'Big text' },
    { cssClass: 'medium-text', label: 'Medium text' },
    { cssClass: 'small-text', label: 'Small text' },
    { cssClass: 'blue-text', label: 'Blue text' },
    { cssClass: 'blue-chart-text', label: 'Blue plot-chart text' },
    { cssClass: 'green-chart-text', label: 'Green plot-chart text' },
    { cssClass: 'yellow-chart-text', label: 'Yellow plot-chart text' },
    { cssClass: 'orange-chart-text', label: 'Orange plot-chart text' },
    { cssClass: 'red-chart-text', label: 'Red plot-chart text' },
    { cssClass: 'blue-circle text-circle', label: 'Blue circle' },
    { cssClass: 'green-circle text-circle', label: 'Green circle' },
    { cssClass: 'orange-circle text-circle', label: 'Orange circle' },
    { cssClass: 'yellow-circle text-circle', label: 'Yellow circle' },
    { cssClass: 'grey-circle text-circle', label: 'Grey circle' },
    { cssClass: 'black-text', label: 'Black text' },
    {
      cssClass: 'uwwt-empty-box blue-uwwt-background',
      label: 'UWWT blue empty box',
    },
    {
      cssClass: 'uwwt-empty-box green-uwwt-background',
      label: 'UWWT green empty box',
    },
    {
      cssClass: 'uwwt-empty-box yellow-uwwt-background',
      label: 'UWWT yellow empty box',
    },
    {
      cssClass: 'uwwt-empty-box orange-uwwt-background',
      label: 'UWWT orange empty box',
    },
    {
      cssClass: 'uwwt-empty-box red-uwwt-background',
      label: 'UWWT red empty box',
    },
  ];
  // config.settings.search_portal_types = [
  //   'Event',
  //   'News Item',
  //   'Document',
  //   'templated_country_factsheet',
  //   'basic_data_factsheet',
  // ];

  return config;
}
