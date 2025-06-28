const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require("../models/Payment"); 
require('dotenv').config();

const router = express.Router();

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount: amount * 100, // paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('❌ Razorpay Order Error:', err);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

// ✅ Verify Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      email
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const saved = await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        currency: "INR",
        userEmail: email || "",
      });

      return res.status(200).json({
        success: true,
        message: "✅ Payment verified",
        paymentId: saved._id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid signature",
      });
    }
  } catch (err) {
    console.error("❌ Razorpay Verify Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
