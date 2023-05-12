import { defineMessages } from 'react-intl';

import TokenWidget from '@plone/volto/components/manage/Widgets/TokenWidget';

import ForestMetadata from '@eeacms/volto-forest-policy/components/theme/Viewlets/ForestMetadata';

import { uniqBy } from 'lodash';

import './slate-inlineStyles.less';

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

function addCustomGroup(config) {
  const hasCustomGroup = config.blocks.groupBlocksOrder.filter(
    (el) => el.id === 'custom_addons',
  );
  if (hasCustomGroup.length === 0) {
    config.blocks.groupBlocksOrder.push({
      id: 'custom_addons',
      title: 'Custom addons',
    });
  }
}

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
  addCustomGroup(config);
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
      '/sitemap',
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

    blocksConfig: {
      ...Object.keys(config.blocks.blocksConfig).reduce((acc, blockKey) => {
        if (
          ['text', 'mostUsed', 'media', 'common'].includes(
            config.blocks.blocksConfig[blockKey].group,
          )
        ) {
          acc[blockKey] = {
            ...config.blocks.blocksConfig[blockKey],
            group: 'common_blocks',
          };
        } else {
          acc[blockKey] = config.blocks.blocksConfig[blockKey];
        }
        return acc;
      }, {}),
    },
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
    {
      cssClass: 'source-formating',
      label: 'Source formatting',
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
