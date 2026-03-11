import { apiRequest } from "./api";

export const paymentService = {
  async preAuthorize(paymentData) {
    return apiRequest("/payments/pre-authorize", {
      method: "POST",
      body: paymentData
    });
  },

  async capture(paymentId, captureData = {}) {
    return apiRequest(`/payments/capture/${paymentId}`, {
      method: "POST",
      body: captureData
    });
  },
  
  async initiateTransfer(transferData) {
    return apiRequest("/v1/transfers", {
      method: "POST",
      body: transferData
    });
  }
};
