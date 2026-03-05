const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require("../models/Payment");
require('dotenv').config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// create a razorpay order (frontend calls this before opening the checkout modal)
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const options = {
      amount: amount * 100, // razorpay expects paise, not rupees
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
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

// verify the payment signature after frontend completes checkout
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      email
    } = req.body;

    // hash-based signature verification per razorpay docs
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // save payment record to db
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
        message: "Payment verified",
        paymentId: saved._id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;