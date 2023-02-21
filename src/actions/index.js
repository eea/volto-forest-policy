import { flattenToAppURL } from '@plone/volto/helpers';
import { GET_CONTENT } from '@plone/volto/constants/ActionTypes';

import {
  GET_FRONTPAGESLIDES,
  // SET_FOLDER_HEADER,
  GET_DEFAULT_HEADER_IMAGE,
  SET_FOLDER_TABS,
  GET_PARENT_FOLDER_DATA,
  GET_LOCALNAVIGATION,
  GET_CHART_DATA_FROM_VISUALIZATION,
  GET_NAVSITEMAP,
  SET_CURRENT_VERSION,
  GET_INDEX_VALUES,
  GET_CONTROLPANEL_FALLBACKS,
  CREATE_ATTACHMENT,
  GET_ALL_ATTACHMENTS,
  GET_ATTACHMENTS,
  DELETE_ATTACHMENT,
  UPDATE_ATTACHMENT,
  GET_PORTLETS,
  FORCE_DRAFT_EDITOR_REFRESH,
  CHANGE_SIDEBAR_STATE,
  CLONE_AS_TYPE,
  CHANGE_MAP_DATA,
  GET_MAP_DATA,
  QUICK_RESET_SEARCH_CONTENT,
  QUICK_SEARCH_CONTENT,
  GET_RESOURCES,
} from '@eeacms/volto-forest-policy/constants/ActionTypes';

import { compact, concat, isArray, join, map, pickBy, toPairs } from 'lodash';
import { dataToQueryString } from '../helpers';

export function setCurrentVersion(payload) {
  return {
    type: SET_CURRENT_VERSION,
    payload: payload,
  };
}

export function getFrontpageSlides() {
  return {
    type: GET_FRONTPAGESLIDES,
    request: {
      op: 'get',
      path: `/frontpage_slides/example.json/@@download/file`,
    },
  };
}

export function getDefaultHeaderImage() {
  return {
    type: GET_DEFAULT_HEADER_IMAGE,
    request: {
      op: 'get',
      path: `/default_header_image?fullobjects`,
    },
  };
}

export function getLocalnavigation(folder) {
  return {
    type: GET_LOCALNAVIGATION,
    request: {
      op: 'get',
      path: `${folder}/@localnavigation`,
    },
  };
}

// export function setFolderHeader(payload) {
//   const actualPayload = {};
//   for (const key in payload) {
//     if (payload[key] !== null && payload[key] !== undefined) {
//       actualPayload[key] = payload[key];
//     }
//   }

//   if (Object.keys(actualPayload)) {
//     return {
//       type: SET_FOLDER_HEADER,
//       payload: actualPayload,
//     };
//   }
//   return;
// }

export function setFolderTabs(payload) {
  return {
    type: SET_FOLDER_TABS,
    payload: payload,
  };
}

export function getParentFolderData(url) {
  return {
    type: GET_PARENT_FOLDER_DATA,
    request: {
      op: 'get',
      path: `/${url}?fullobjects`,
      accept: 'application/json',
    },
  };
}

// export function getDataProviders() {
//   return {
//     type: GET_DATA_PROVIDERS,
//     request: {
//       op: 'get',
//       path: `/@mosaic-settings`,
//     },
//   };
// }

export function getChartDataFromVisualization(path) {
  return {
    type: GET_CHART_DATA_FROM_VISUALIZATION,
    request: {
      op: 'get',
      path,
    },
  };
}

export function getNavSiteMap(url, depth) {
  // Note: Depth can't be 0 in plone.restapi
  return {
    type: GET_NAVSITEMAP,
    request: {
      op: 'get',
      path: `${url}/@navigation?expand.navigation.depth=${depth || 3}`,
    },
  };
}

export function getIndexValues(name) {
  return {
    type: GET_INDEX_VALUES,
    request: {
      op: 'post',
      path: '/@index-values',
      data: { name },
    },
  };
}

export function getContentWithData(
  url,
  version = null,
  subrequest = null,
  data = {},
) {
  const qs = dataToQueryString(data);
  return {
    type: GET_CONTENT,
    subrequest,
    request: {
      op: 'get',
      path: `${url}${version ? `/@history/${version}` : ''}?fullobjects${
        data ? '&' + qs : ''
      }`,
      data,
    },
  };
}

export function getControlpanelFallbacks() {
  return {
    type: GET_CONTROLPANEL_FALLBACKS,
    request: {
      op: 'get',
      path: '/@controlpanels-fallbacks',
    },
  };
}

export function createAttachment(url, content) {
  return {
    type: CREATE_ATTACHMENT,
    request: {
      op: 'post',
      path: url,
      data: content,
    },
  };
}

export function getAllAttachments(path) {
  return {
    type: GET_ALL_ATTACHMENTS,
    request: {
      op: 'get',
      path,
    },
  };
}

export function getAttachments(path, _type) {
  return {
    type: GET_ATTACHMENTS,
    request: {
      op: 'get',
      path,
      data: { container: _type },
    },
  };
}

export function deleteAttachment(path) {
  return {
    type: DELETE_ATTACHMENT,
    request: {
      op: 'del',
      path: flattenToAppURL(path),
    },
  };
}

export function updateAttachment(path, data) {
  return {
    type: UPDATE_ATTACHMENT,
    request: {
      op: 'patch',
      path: flattenToAppURL(path),
      data,
    },
  };
}

export function getPortlets(path, name) {
  const url = name ? `${path}/@portlets/${name}` : `${path}/@portlets`;
  return {
    type: GET_PORTLETS,
    subrequest: name,
    request: {
      op: 'get',
      path: url,
    },
  };
}

export function forceDraftEditorRefresh(key) {
  return {
    type: FORCE_DRAFT_EDITOR_REFRESH,
    editorKey: key,
  };
}

export function changeSidebarState(open) {
  return {
    type: CHANGE_SIDEBAR_STATE,
    open,
  };
}

export function cloneAsType(path, typeName) {
  return {
    type: CLONE_AS_TYPE,
    request: {
      op: 'post',
      path: `${path}/@clone-as-type`,
      data: {
        typeName,
      },
    },
  };
}

export function changeMapData(mapData) {
  localStorage.setItem('mapData', JSON.stringify(mapData));
  // console.log('coming her', mapData);
  return {
    type: CHANGE_MAP_DATA,
    mapData,
  };
}

export function getMapData() {
  const mapData = JSON.parse(localStorage.getItem('mapData'));
  // console.log('got new data', mapData);
  return {
    type: GET_MAP_DATA,
    mapData,
  };
}

export function quickSearchContent(url, options, subrequest = null, filters) {
  let queryArray = [];
  const arrayOptions = pickBy(options, (item) => isArray(item));

  queryArray = concat(
    queryArray,
    options
      ? join(
          map(toPairs(pickBy(options, (item) => !isArray(item))), (item) => {
            if (item[0] === 'SearchableText') {
              // Adds the wildcard to the SearchableText param
              item[1] = `${item[1]}*`;
            } else if (!item[1]) return;
            return join(item, '=');
          }),
          '&',
        )
      : '',
  );

  queryArray = concat(
    queryArray,
    arrayOptions
      ? join(
          map(pickBy(arrayOptions), (item, key) => {
            return join(
              item.map((value) => `${key}=${value}`),
              '&',
            );
          }),
          '&',
        )
      : '',
  );

  const querystring = join(compact(queryArray), '&');

  return {
    type: QUICK_SEARCH_CONTENT,
    subrequest,
    filters,
    request: {
      op: 'get',
      path: `${url}/@search${querystring ? `?${querystring}` : ''}`,
    },
  };
}

export function quickResetSearchContent(subrequest = null) {
  return {
    type: QUICK_RESET_SEARCH_CONTENT,
    subrequest,
  };
}

export function getResources(path, b_size = 5, b_start = 0, metadata = []) {
  let metadata_fields = '';
  metadata.forEach((item) => {
    metadata_fields += `&metadata_fields=${item}`;
  });
  return {
    type: GET_RESOURCES,
    dataType: path,
    request: {
      op: 'get',
      path: `/${path}/aggregator/?b_size:int=${b_size}&b_start:int=${b_start}${metadata_fields}`,
    },
  };
}
