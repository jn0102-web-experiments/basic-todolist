import { Action, ThunkAction, combineReducers, configureStore } from "@reduxjs/toolkit"
import logger from "redux-logger"
import { persistReducer, persistStore } from "redux-persist"
import storage from 'redux-persist/lib/storage'
import { createStateSyncMiddleware, initMessageListener } from "redux-state-sync"
import { todoListsSliceReducer } from "./features/TodoLists/state/todoListsSlice"
import { themingSliceReducer } from "./state/themingSlice"

const rootReducer = combineReducers({
  theme: themingSliceReducer,
  todoLists: todoListsSliceReducer,
})

const persistedReducer = persistReducer(
  {
    key: 'basic-todolist-app-test',
    storage,
  },
  rootReducer
)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [
    logger,
    createStateSyncMiddleware({
      blacklist: ['persist/PERSIST', 'persist/REHYDRATE'],
    }),
  ],
})

initMessageListener(store)

export const persistor = persistStore(store)
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
