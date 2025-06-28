import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  try {
    const options = {
      amount: amount * 100, // ₹ -> paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order creation failed", err);
    res.status(500).json({ success: false, error: "Payment initialization failed" });
  }
};
