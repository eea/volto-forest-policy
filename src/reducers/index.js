/**
 * Root reducer.
 * @module reducers/root
 */

import defaultReducers from '@plone/volto/reducers';
import frontpage_slides from '@eeacms/volto-forest-policy/reducers/frontpage_slides';
import folder_header from '@eeacms/volto-forest-policy/reducers/folder_header';
import folder_tabs from '@eeacms/volto-forest-policy/reducers/folder_tabs';
import default_header_image from '@eeacms/volto-forest-policy/reducers/default_header_image';
import parent_folder_data from '@eeacms/volto-forest-policy/reducers/parent_folder_data';
import localnavigation from '@eeacms/volto-forest-policy/reducers/localnavigation';
import current_version from '@eeacms/volto-forest-policy/reducers/current_version';
import cloned_type from '@eeacms/volto-forest-policy/reducers/cloned_type';
import attachments, {
  create_attachment,
} from '@eeacms/volto-forest-policy/reducers/attachments';
import index_values from '@eeacms/volto-forest-policy/reducers/index_values';
import controlpanel_fallbacks from '@eeacms/volto-forest-policy/reducers/controlpanel_fallbacks';
import portlets from '@eeacms/volto-forest-policy/reducers/portlets';
import drafteditor_refresh from '@eeacms/volto-forest-policy/reducers/drafteditor_refresh';
import sidebar_state from '@eeacms/volto-forest-policy/reducers/sidebar_state';
import map_data from '@eeacms/volto-forest-policy/reducers/map_data';
import resources from '@eeacms/volto-forest-policy/reducers/resources';
import quicksearch from '@eeacms/volto-forest-policy/reducers/quicksearch';

/**
 * Root reducer.
 * @function
 * @param {Object} state Current state.
 * @param {Object} action Action to be handled.
 * @returns {Object} New state.
 */
const reducers = {
  ...defaultReducers,
  frontpage_slides,
  folder_header,
  default_header_image,
  folder_tabs,
  parent_folder_data,
  localnavigation,
  current_version,
  attachments,
  cloned_type,
  create_attachment,
  index_values,
  controlpanel_fallbacks,
  portlets,
  drafteditor_refresh,
  sidebar_state,
  map_data,
  resources,
  quicksearch,
};

export default reducers;
