import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "@/lib/paymentService";

export const preAuthorizePayment = createAsyncThunk(
  "payment/preAuthorize",
  async (paymentData, { rejectWithValue }) => {
    try { return await paymentService.preAuthorize(paymentData); } 
    catch (error) { return rejectWithValue(error.message); }
  }
);

export const capturePayment = createAsyncThunk(
  "payment/capture",
  async ({ paymentId, captureData }, { rejectWithValue }) => {
    try { return await paymentService.capture(paymentId, captureData); } 
    catch (error) { return rejectWithValue(error.message); }
  }
);

export const initiateTransfer = createAsyncThunk(
  "payment/transfer",
  async (transferData, { rejectWithValue }) => {
    try { return await paymentService.initiateTransfer(transferData); }
    catch (error) { return rejectWithValue(error.message); }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: { 
    loading: false, 
    error: null, 
    paymentId: null, 
    paymentStatus: "idle", // 'idle' | 'authorized' | 'captured'
    transferStatus: "idle" // 'idle' | 'loading' | 'success' | 'failed'
  },
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false; 
      state.error = null; 
      state.paymentId = null; 
      state.paymentStatus = "idle";
      state.transferStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Pre-Auth
      .addCase(preAuthorizePayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(preAuthorizePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentId = action.payload.paymentId || action.payload.id;
        state.paymentStatus = "authorized";
      })
      .addCase(preAuthorizePayment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Capture
      .addCase(capturePayment.pending, (state) => { state.loading = true; state.paymentStatus = "capturing"; })
      .addCase(capturePayment.fulfilled, (state) => { state.loading = false; state.paymentStatus = "captured"; })
      .addCase(capturePayment.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Transfer
      .addCase(initiateTransfer.pending, (state) => { state.loading = true; state.transferStatus = "loading"; })
      .addCase(initiateTransfer.fulfilled, (state) => { state.loading = false; state.transferStatus = "success"; })
      .addCase(initiateTransfer.rejected, (state, action) => { state.loading = false; state.transferStatus = "failed"; state.error = action.payload; });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export const selectPaymentState = (state) => state.payment;
export default paymentSlice.reducer;
