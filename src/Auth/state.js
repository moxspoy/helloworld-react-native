import { API_ENDPOINT } from '../common/config';

import * as FetchHelper from '../common/fetch.helper';
import * as StateHelper from '../common/state.helper';

import * as Activity from '../Shared/Activity';

import { AuthService } from './Auth.service';

/**
 * Module name
 */

export const MODULE = 'Auth';

/**
 * Initial state
 */

const INITIAL_STATE = {
  authenticated: false,
  user: null,
};

/**
 * Reset
 */

export const $reset = StateHelper.createSimpleOperation(MODULE, 'reset', () => $reset.action());

/**
 * Login
 */

export const $login = StateHelper.createAsyncOperation(MODULE, 'login', (username, password) => {
  return (dispatch) => {
    Activity.processing(MODULE, $login.NAME);
    dispatch($login.request());

    return AuthService.login(username, password)
      .then((result) => dispatch($login.success(result)))
      .catch((error) => dispatch($login.failure(error)))
      .finally(() => Activity.done(MODULE, $login.NAME));
  };
});

/**
 * Logout
 */

export const $logout = StateHelper.createSimpleOperation(MODULE, 'logout', () => {
  return (dispatch) => {
    dispatch($logout.action());
    return AuthService.logout();
  };
});

/**
 * Signup
 */

export const $signup = StateHelper.createAsyncOperation(MODULE, 'signup', (payload) => {
  return async (dispatch) => {
    Activity.processing(MODULE, $signup.NAME);
    dispatch($signup.request());

    return AuthService.signup(payload)
      .then((result) => dispatch($signup.success(result)))
      .catch((error) => dispatch($signup.failure(error)))
      .finally(() => Activity.done(MODULE, $signup.NAME));
  };
});

/**
 * Initiate password reset
 */

export const $requestPasswordReset = StateHelper.createAsyncOperation(MODULE, 'requestPasswordReset', (email) => {
  return (dispatch) => {
    Activity.processing(MODULE, $requestPasswordReset.NAME);
    dispatch($requestPasswordReset.request());

    return AuthService.requestPasswordReset(email)
      .then((result) => dispatch($requestPasswordReset.success(result)))
      .catch((error) => dispatch($requestPasswordReset.failure(error)))
      .finally(() => Activity.done(MODULE, $requestPasswordReset.NAME));
  };
});

/**
 * Fetch profile
 */

export const $fetchProfile = StateHelper.createAsyncOperation(MODULE, 'fetchProfile', () => {
  return (dispatch) => {
    Activity.processing(MODULE, $fetchProfile.NAME);
    dispatch($fetchProfile.request());

    return fetch(`${API_ENDPOINT}/user`, {
      headers: {
        Authorization: `Bearer ${AuthService.getAccessToken()}`,
      },
    })
      .then(FetchHelper.ResponseHandler, FetchHelper.ErrorHandler)
      .then((result) => dispatch($fetchProfile.success(result)))
      .catch((error) => dispatch($fetchProfile.failure(error)))
      .finally(() => Activity.done(MODULE, $fetchProfile.NAME));
  };
});

/**
 * Reducer
 */

export function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case $login.REQUEST:
      return {
        ...state,
        user: null,
      };
    case $login.SUCCESS:
    case $signup.SUCCESS:
    case $fetchProfile.SUCCESS:
      const initials = action.user.name
        .split(/\W+/)
        .map((w) => w[0] || '')
        .join('')
        .toUpperCase();

      return {
        ...state,
        authenticated: true,
        user: {
          ...action.user,
          initials,
        },
      };
    case $logout.ACTION:
      return {
        ...state,
        authenticated: false,
        user: null,
      };
    default:
      return state;
  }
}

/**
 * Persister
 */

export function persister({ authenticated, user }) {
  return {
    authenticated,
    user,
  };
}
