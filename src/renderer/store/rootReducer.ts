import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';

import player from './modules/player';
import subtitle from './modules/subtitle';
import timeline from './modules/timeline';
import welcome from './modules/welcome';

const rootReducer = combineReducers({
  player,
  subtitle,
  timeline,
  welcome,
});

export default rootReducer;

export type RootState = StateType<typeof rootReducer>;
