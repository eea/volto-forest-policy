import Forbidden from '@plone/volto/components/theme/Forbidden/Forbidden';
import Unauthorized from '@plone/volto/components/theme/Unauthorized/Unauthorized';

import installAppExtras from '@eeacms/volto-forest-policy/components/theme/AppExtras';

import { applyConfig as installFiseFrontend } from './localconfig';
import installDiscodataConnectorBlock from '@eeacms/volto-forest-policy/components/manage/Blocks/DiscodataConnectorBlock';
import installExpandableDataTable from './components/manage/Blocks/SimpleDataTable';
import installImageCards from './components/manage/Blocks/ImageCards';

import fiseLogo from '@eeacms/volto-forest-policy/../theme/site/assets/images/Header/fise-logo.svg';
import fiseWhiteLogo from '@eeacms/volto-forest-policy/../theme/site/assets/images/Header/fise-logo-white.svg';

import ObjectListInlineWidget from './components/manage/Widgets/ObjectListInlineWidget';
import reducers from '@eeacms/volto-forest-policy/reducers';

import linkSVG from '@plone/volto/icons/link.svg';
import { makeInlineElementPlugin } from '@plone/volto-slate/elementEditor';

import { LINK } from '@plone/volto-slate/constants';
import { LinkElement } from '@plone/volto-slate/editor/plugins/AdvancedLink/render';
import { withLink } from '@plone/volto-slate/editor/plugins/AdvancedLink/extensions';
import { linkDeserializer } from '@plone/volto-slate/editor/plugins/AdvancedLink/deserialize';
import LinkEditSchema from '@plone/volto-slate/editor/plugins/AdvancedLink/schema';
import { defineMessages } from 'react-intl'; // , defineMessages

import HiddenWidget from '@eeacms/volto-forest-policy/components/manage/Widgets/Hidden';
// import PickObject from './PickObject';

import AlignBlockWidget from '@eeacms/volto-forest-policy/components/manage/Widgets/Align';

import {
  NavigationPortlet,
  DefaultPortlet,
  PortletManagerRenderer,
  ClassicPortlet,
} from '@eeacms/volto-forest-policy/components/theme/Portlets';

const messages = defineMessages({
  edit: {
    id: 'Edit link',
    defaultMessage: 'Edit link',
  },
  delete: {
    id: 'Remove link',
    defaultMessage: 'Remove link',
  },
});

function addCustomGroup(config) {
  const hasCustomGroup = config.blocks.groupBlocksOrder.filter((el) => {
    return el.id === 'custom_addons';
  });
  if (hasCustomGroup.length === 0) {
    config.blocks.groupBlocksOrder.push({
      id: 'custom_addons',
      title: 'Custom addons',
    });
  }
}
function renamePlotlyGroup(config) {
  const plotlyGroup = config.blocks.groupBlocksOrder.filter(
    (el) => el.id === 'plotly',
  );
  if (plotlyGroup.length) {
    plotlyGroup[0].title = 'Data visualizations';
  }
  return config;
}

function removeDataBlocksGroup(config) {
  config.blocks.groupBlocksOrder = config.blocks.groupBlocksOrder.filter(
    (el) => el.id !== 'data_blocks',
  );
  return config;
}

// cleanup blocks from available block chooser list that shouldn't be visible
function restrictAvailableBlocks(config) {
  config.blocks.blocksConfig = {
    ...Object.keys(config.blocks.blocksConfig).reduce((acc, blockKey) => {
      if (
        [
          'treemapChart',
          'countryFlag',
          'tableau_block',
          'plotly_chart',
        ].includes(config.blocks.blocksConfig[blockKey].id)
      ) {
        config.blocks.blocksConfig[blockKey].restricted = true;
      }
      acc[blockKey] = config.blocks.blocksConfig[blockKey];
      return acc;
    }, {}),
  };
  return config;
}

export default function applyConfig(config) {
  // Add here your project's configuration here by modifying `config` accordingly
  addCustomGroup(config);
  removeDataBlocksGroup(config);
  restrictAvailableBlocks(config);
  renamePlotlyGroup(config);

  config = [
    installAppExtras,
    installFiseFrontend,
    installDiscodataConnectorBlock,
    installExpandableDataTable,
    installImageCards,
  ].reduce((acc, apply) => apply(acc), config);

  config.settings = {
    ...config.settings,
    frontendMeta: {
      version: process.env.RAZZLE_FRONTEND_VERSION,
      version_url: process.env.RAZZLE_FRONTEND_VERSION_URL,
      published_at: process.env.RAZZLE_FRONTEND_PUBLISHED_AT,
    },
    timezone: 'CET',
    pathsWithFullobjects: ['/news', '/events'],
    pathsWithExtraParameters: {
      '/news': {
        b_start: 0,
        b_size: 100000,
        metadatafields: '_all',
      },
      '/events': {
        b_start: 0,
        b_size: 100000,
        metadatafields: '_all',
      },
      '/latest-news-events-on-forest': {
        include_items: 'False',
      },
    },
  };

  // EEA customizations
  config.settings.eea = {
    ...(config.settings.eea || {}),
    headerOpts: {
      ...(config.settings.eea?.headerOpts || {}),
      logo: fiseLogo,
      logoWhite: fiseWhiteLogo,
    },
    headerSearchBox: [
      {
        isDefault: true,
        // to replace search path change path to whatever you want and match with the page in volto website
        path: '/advanced-search',
        placeholder: 'Search FISE...',
        description:
          'Looking for more information? Try searching the full EEA website content',
        buttonTitle: 'Go to advanced search',
        buttonUrl: 'https://www.eea.europa.eu/en/advanced-search',
      },
    ],
    logoTargetUrl: '/',
  };

  config.views = {
    ...config.views,
    errorViews: {
      ...config.views.errorViews,
      '403': Forbidden,
      '401': Unauthorized,
    },
  };

  // // Custom Homepage layouts
  // config.views.layoutViews = {
  //   ...(config.views.layoutViews || {}),
  //   homepage_view: HomePageView,
  //   homepage_inverse_view: HomePageInverseView,
  // };

  config.widgets = {
    ...config.widgets,
    widget: {
      ...config.widgets.widget,
      object_list_inline: ObjectListInlineWidget,
    },
  };

  config.widgets.id.blocks = HiddenWidget;
  config.widgets.id.blocks_layout = HiddenWidget;

  // config.widgets.widget.object_by_path = PickObject;
  config.widgets.widget.align = AlignBlockWidget;

  config.blocks.blocksConfig.embed_eea_tableau_block.group = 'plotly';
  config.blocks.blocksConfig.embed_eea_map_block.group = 'plotly';
  config.blocks.blocksConfig.simpleDataConnectedTable.group = 'custom_addons';

  config.addonReducers = {
    ...config.addonReducers,
    ...reducers,
  };

  // export const portlets = {
  //   ...config.portlets,
  // };

  config.settings.portlets = {
    managers: {
      ...config.portlets?.managers,
      default: PortletManagerRenderer,
    },
    renderers: {
      'portlets.Navigation': NavigationPortlet,
      'portlets.Classic': ClassicPortlet,
      default: DefaultPortlet,
    },
  };

  config.settings.virtualHostedPaths = ['**/RSS'];
  config.settings.slate = config.settings.slate || {};
  config.settings.slate.styleMenu = config.settings.slate.styleMenu || {};

  //advancedlink is currently not working properly/not recognized in fise, so we add it to config manually
  const { slate } = config.settings;

  slate.toolbarButtons = [...(slate.toolbarButtons || []), LINK];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    LINK,
  ];

  slate.htmlTagsToSlate.A = linkDeserializer;

  const opts = {
    title: 'Link',
    pluginId: LINK,
    elementType: LINK,
    element: LinkElement,
    isInlineElement: true,
    editSchema: LinkEditSchema,
    extensions: [withLink],
    hasValue: (formData) => !!formData.link,
    toolbarButtonIcon: linkSVG,
    messages,
  };

  const [installLinkEditor] = makeInlineElementPlugin(opts);
  config = installLinkEditor(config);

  console.log(config.settings.slate, 'slate');
  return config;
}
