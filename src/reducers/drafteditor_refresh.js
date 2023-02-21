import { FORCE_DRAFT_EDITOR_REFRESH } from '@eeacms/volto-forest-policy/constants/ActionTypes';

const initialState = {
  editorKey: '',
};

export default function drafteditor_refresh(state = initialState, action = {}) {
  switch (action.type) {
    case FORCE_DRAFT_EDITOR_REFRESH:
      return {
        editorKey: action.editorKey,
      };
    default:
      return state;
  }
}
