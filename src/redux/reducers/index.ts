import { combineReducers } from "redux";
import gameReducer from "./Reducer.ts";

const rootReducer = combineReducers({
  game: gameReducer,
});

export default rootReducer;
