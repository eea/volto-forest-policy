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

import './slate-styles.css';

import linkSVG from '@plone/volto/icons/link.svg';
import { makeInlineElementPlugin } from '@plone/volto-slate/elementEditor';

import { LINK } from '@plone/volto-slate/constants';
import { LinkElement } from '@plone/volto-slate/editor/plugins/AdvancedLink/render';
import { withLink } from '@plone/volto-slate/editor/plugins/AdvancedLink/extensions';
import { linkDeserializer } from '@plone/volto-slate/editor/plugins/AdvancedLink/deserialize';
import LinkEditSchema from '@plone/volto-slate/editor/plugins/AdvancedLink/schema';
import { defineMessages } from 'react-intl'; // , defineMessages

import chartIcon from '@plone/volto/icons/world.svg';

import HiddenWidget from '@eeacms/volto-forest-policy/components/manage/Widgets/Hidden';
import CollectionYears from '@eeacms/volto-forest-policy/components/manage/Widgets/CollectionYears';
// import PickObject from './PickObject';

import AlignBlockWidget from '@eeacms/volto-forest-policy/components/manage/Widgets/Align';

import CollectionBlockView from '@eeacms/volto-forest-policy/components/theme/Collection/BlockView';
import CollectionBlockEdit from '@eeacms/volto-forest-policy/components/theme/Collection/BlockEdit';
import CollectionView from '@eeacms/volto-forest-policy/components/theme/Collection/View';

import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';

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

export default function applyConfig(config) {
  // Add here your project's configuration here by modifying `config` accordingly
  addCustomGroup(config);

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
        path: '/fisesearch',
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

  config.views.contentTypesViews.Collection = CollectionView;

  config.widgets = {
    ...config.widgets,
    widget: {
      ...config.widgets.widget,
      object_list_inline: ObjectListInlineWidget,
    },
  };

  config.widgets.id.collection_years = CollectionYears;
  config.widgets.id.blocks = HiddenWidget;
  config.widgets.id.blocks_layout = HiddenWidget;

  // config.widgets.widget.object_by_path = PickObject;
  config.widgets.widget.align = AlignBlockWidget;

  config.blocks.blocksConfig.collection_block = {
    id: 'collection_block',
    title: 'Collection Listing',
    view: CollectionBlockView,
    edit: CollectionBlockEdit,
    icon: chartIcon,
    group: 'custom_addons',
  };

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
  config.settings.slate.styleMenu.inlineStyles = [
    ...(config.settings.slate.styleMenu?.inlineStyles || []),
    {
      cssClass: 'white-text',
      label: 'White text',
    },
    // blue series
    {
      cssClass: 'blue-powder-text',
      label: 'Blue powder text',
    },
    {
      cssClass: 'blue-lightsteel-text',
      label: 'Blue lightsteel text',
    },
    {
      cssClass: 'blue-cadet-text',
      label: 'Blue cadet text',
    },
    {
      cssClass: 'blue-teal-text',
      label: 'Blue teal text',
    },
    {
      cssClass: 'blue-darkslate-text',
      label: 'Blue darkslate text',
    },
    // green series
    {
      cssClass: 'green-blanchedalmond-text',
      label: 'Green blanchedalmond text',
    },
    {
      cssClass: 'green-tan-text',
      label: 'Green tan text',
    },
    {
      cssClass: 'green-olivedrab-text',
      label: 'Green olivedrab text',
    },
    {
      cssClass: 'light-green-text',
      label: 'Light green text',
    },
    {
      cssClass: 'green-forest-text',
      label: 'Green forest text',
    },
    {
      cssClass: 'green-darkslate-text',
      label: 'Green darkslate text',
    },

    // army series
    {
      cssClass: 'army-darkolivegreen-text',
      label: 'Army darkolivegreen text',
    },
    {
      cssClass: 'army-yellowgreen-text',
      label: 'Army yellowgreen text',
    },
    {
      cssClass: 'army-olivedrab-text',
      label: 'Army olivedrab text',
    },
    {
      cssClass: 'army-moccasin-text',
      label: 'Army moccasin text',
    },
    {
      cssClass: 'army-khaki-text',
      label: 'Army khaki text',
    },

    //red series
    {
      cssClass: 'red-mistyrose-text',
      label: 'Red mistyrose text',
    },
    {
      cssClass: 'red-darksalmon-text',
      label: 'Red darksalmon text',
    },
    {
      cssClass: 'red-indian-text',
      label: 'Red indian text',
    },
    {
      cssClass: 'red-brown-text',
      label: 'Red brown text',
    },
    {
      cssClass: 'red-dark-text',
      label: 'Red dark text',
    },

    //orange set
    {
      cssClass: 'orange-mistyrose-text',
      label: 'Orange mistyrose text',
    },
    {
      cssClass: 'orange-pale-text',
      label: 'Orange pale text',
    },
    {
      cssClass: 'orange-gold-text',
      label: 'Orange gold text',
    },
    {
      cssClass: 'orange-text',
      label: 'Orange text',
    },
    {
      cssClass: 'orange-sienna-text',
      label: 'Orange sienna text',
    },
    {
      cssClass: 'orange-saddle-text',
      label: 'Orange saddle text',
    },

    //black set
    {
      cssClass: 'black-text',
      label: 'Black text',
    },
    {
      cssClass: 'black-dimgray-text',
      label: 'Black dimgray text',
    },
    {
      cssClass: 'black-gray-text',
      label: 'Black gray text',
    },
    {
      cssClass: 'black-silver-text',
      label: 'Black silver text',
    },
    {
      cssClass: 'black-gainsboro-text',
      label: 'Black gainsboro text',
    },

    {
      cssClass: 'blue-text',
      label: 'Blue text',
    },
    {
      cssClass: 'red-text',
      label: 'Red text',
    },
    {
      cssClass: 'yellow-text',
      label: 'Yellow text',
    },
    {
      cssClass: 'grey-text',
      label: 'Grey text',
    },

    // font-sizes
    {
      cssClass: 'x-large',
      label: 'x-large',
    },
    {
      cssClass: 'xx-large',
      label: 'xx-large',
    },
    {
      cssClass: 'xxx-large',
      label: 'xxx-large',
    },
  ];

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

  console.log(config?.views?.layoutViews, 'config.views.layoutViews');

  return config;
}
