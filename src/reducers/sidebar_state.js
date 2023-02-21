import { CHANGE_SIDEBAR_STATE } from '@eeacms/volto-forest-policy/constants/ActionTypes';

const initialState = {
  open: false,
};

export default function drafteditor_refresh(state = initialState, action = {}) {
  switch (action.type) {
    case CHANGE_SIDEBAR_STATE:
      return {
        open: action.open,
      };
    default:
      return state;
  }
}
