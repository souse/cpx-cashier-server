import {
  LOGIN_PENDING,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT_SUCCESS,
  FETCH_PROFILE_PENDING,
  FETCH_PROFILE_SUCCESS,
  LOGOUT
} from '../actions/user';
import { setUser, checkAjaxError } from '../utils';

const initialState = {
  user: null,
  loggingIn: false,
  loggingOut: false,
  ajaxError: null
};

export default function auth(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN_PENDING:
      return Object.assign({}, initialState, { loggingIn: true });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {user: action.payload.data, loggingIn: false, ajaxError: checkAjaxError(action.payload)});
    case LOGIN_ERROR:
      return {
        ...state,
        loggingIn: false,
        user: null,
        ajaxError: action.payload.message
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        user: null,
        ajaxError: null
      };
    case FETCH_PROFILE_SUCCESS:
      return Object.assign({}, state, {user: action.payload.data, loggingIn: false, ajaxError: checkAjaxError(action.payload)});
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}
