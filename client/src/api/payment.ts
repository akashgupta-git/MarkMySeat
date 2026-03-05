import api from "../utils/axios";

// create a razorpay order (call this before opening checkout modal)
export const createPaymentOrder = async (amount: number): Promise<{ orderId: string }> => {
  const response = await api.post("/payment/create-order", {
    amount,
    currency: "INR",
  });
  return response.data;
};

// verify payment signature after razorpay checkout completes
export const verifyPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  email: string;
}): Promise<{ success: boolean; paymentId: string }> => {
  const response = await api.post("/payment/verify", data);
  return response.data;
};