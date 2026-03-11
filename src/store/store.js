import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tickerReducer from "./slices/tickerSlice";
import uiReducer from "./slices/uiSlice";
import paymentReducer from "./slices/paymentSlice";
import { toastMiddleware } from "./toastMiddleware";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ticker: tickerReducer,
      ui: uiReducer,
      payment: paymentReducer,
    },
    middleware: (gDM) => gDM().concat(toastMiddleware),
    devTools: process.env.NODE_ENV !== "production",
  });
}

export const store = makeStore();

export const RootState = undefined;
export const AppDispatch = undefined;


