import { Action, MiddlewareArray, ThunkAction, combineReducers, configureStore } from "@reduxjs/toolkit"
import logger from "redux-logger"
import { persistReducer, persistStore } from "redux-persist"
import storage from 'redux-persist/lib/storage'
import { createStateSyncMiddleware, initMessageListener } from "redux-state-sync"
import { todoListsSliceReducer } from "./features/TodoLists/state/todoListsSlice"
import { themingSliceReducer } from "./state/themingSlice"

const BUILD_MODE = import.meta.env.MODE as ('development' | 'production');

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
  middleware(_getDefaultMiddleWare) {
    let middlewares = new MiddlewareArray<any>()

    middlewares.push(createStateSyncMiddleware({
      blacklist: ['persist/PERSIST', 'persist/REHYDRATE'],
    }))

    if (BUILD_MODE === 'development') {
      middlewares.push(logger)
    }

    return middlewares
  },
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
