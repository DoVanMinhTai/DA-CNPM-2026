import axiosInstance from './axiosInstance';

export const paymentApi = {
  /**
   * Lấy thông tin billing: gói hiện tại, credit balance, next billing date,
   * trạng thái cancelable/reactivatable.
   *
   * @returns {Promise<Object>} BillingInfoResponse
   *   { currentPlan, amount, nextBilling, credits: { used, total },
   *     isCancelable, isReactivatable, isCancelled }
   */
  getBillingInfo: async () => {
    const { data } = await axiosInstance.get('/api/billing/info');
    return data;
  },

  /**
   * Khởi tạo link thanh toán VNPay.
   * Backend tạo chữ ký bảo mật và trả về checkout URL của VNPay Sandbox.
   *
   * @param {string} packageType - Loại gói cần mua (e.g. "PRO", "CREDIT_10", "CREDIT_50")
   * @returns {Promise<Object>} { paymentUrl }
   */
  createPaymentUrl: async (packageType) => {
    const { data } = await axiosInstance.post(
      `/api/payment/create-payment-url?packageType=${encodeURIComponent(packageType)}`
    );
    return data;
  },

  /**
   * Hủy gói subscription hiện tại.
   * Gói vẫn active đến cuối chu kỳ billing.
   *
   * @returns {Promise<Object>} { message }
   */
  cancelSubscription: async () => {
    const { data } = await axiosInstance.post('/api/billing/cancel');
    return data;
  },

  /**
   * Kích hoạt lại gói đã hủy (trước khi hết chu kỳ).
   *
   * @returns {Promise<Object>} { message }
   */
  reactivateSubscription: async () => {
    const { data } = await axiosInstance.post('/api/billing/reactivate');
    return data;
  },
};
