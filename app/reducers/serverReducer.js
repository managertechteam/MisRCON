/**
 * Name: notifyReducer
 * Created by chris on 3/17/2017.
 * Description:
 */
// TODO: Store these credentials better somehow
import * as actionType from '../constants/ActionTypes';

let initialState = {
  status: {
    name: '',
    ip: '',
    version: '',
    level: '',
    gameRules: '',
    time: '',
    players: '',
    playersArray: [],
  },
  whitelist: [],
  banlist: [],
};

export default function server(state = initialState, action) {
  switch (action.type) {
    case actionType.UPDATE_SERVER_STATUS:
      return {...state, status: action.payload};
    case actionType.UPDATE_SERVER_WHITELIST:
      return {...state, whitelist: action.payload};
    case actionType.UPDATE_SERVER_BANLIST:
      return {...state, banlist: action.payload};
    default:
      return state;
  }
}