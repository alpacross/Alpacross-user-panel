import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, endpoints } from "@/lib/api";

const initialState = { data: null, status: "idle", error: null };

export const fetchTicker = createAsyncThunk("ticker/fetch", async (_, { rejectWithValue }) => {
  try {
    return await apiRequest(endpoints.ticker());
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const tickerSlice = createSlice({
  name: "ticker",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicker.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchTicker.fulfilled, (state, action) => { state.status = "succeeded"; state.data = action.payload; })
      .addCase(fetchTicker.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || action.error.message; });
  }
});

export default tickerSlice.reducer;



