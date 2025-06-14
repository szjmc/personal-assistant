import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import authReducer from './reducers/authReducer';
import taskReducer from './reducers/taskReducer';
import noteReducer from './reducers/noteReducer';
import calendarReducer from './reducers/calendarReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  notes: noteReducer,
  calendar: calendarReducer
});

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;    