import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  globalLoading: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showLoader(state) { state.globalLoading = true; },
    hideLoader(state) { state.globalLoading = false; },
    addToast: {
      reducer(state, action) { state.toasts.push(action.payload); },
      prepare({ type = "info", title, description, duration = 3000 }) {
        return { payload: { id: nanoid(), type, title, description, duration } };
      },
    },
    removeToast(state, action) { state.toasts = state.toasts.filter(t => t.id !== action.payload); },
    clearToasts(state) { state.toasts = []; },
  },
});

export const { showLoader, hideLoader, addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;



