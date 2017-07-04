import {
    GET_ALL_MENU,
    GET_ALL_MENU_SUCCESS,
    UPDATE_NAVPATH
} from '../actions/menu';

const initialState = {
  items: [],
  navpath: []
};

export default function menu(state = initialState, action = {}) {
  switch (action.type) {
    case GET_ALL_MENU_SUCCESS:
      return Object.assign({}, initialState, {items: action.payload.menus});
    case UPDATE_NAVPATH:
      return {
        ...state,
        path: action.path,
        key: action.key
      }
    default:
      return state;
  }
}
